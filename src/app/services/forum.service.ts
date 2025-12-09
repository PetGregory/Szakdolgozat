import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDocs, query, where, updateDoc, increment, getDoc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

export interface ForumPost {
  id?: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  replies?: ForumReply[];
  replyCount?: number;
}

export interface ForumReply {
  id?: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface PostLike {
  userId: string;
  postId: string;
  type: 'like' | 'dislike';
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private firestore: Firestore = inject(Firestore);

  async createPost(title: string, description: string, authorId: string, authorName: string): Promise<string> {
    const postId = doc(collection(this.firestore, 'forumPosts')).id;
    const postRef = doc(this.firestore, 'forumPosts', postId);
    const postData = {
      title: title.trim(),
      description: description.trim(),
      authorId: authorId,
      authorName: authorName || 'Anonymous',
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replyCount: 0
    };
    
    await setDoc(postRef, postData);
    return postId;
  }

  async getPosts(): Promise<ForumPost[]> {
    const postsRef = collection(this.firestore, 'forumPosts');
    const querySnapshot = await getDocs(postsRef);
    
    const posts: ForumPost[] = [];
    querySnapshot.forEach((docSnap) => {
      const postData = docSnap.data();
      const post: ForumPost = {
        id: docSnap.id,
        title: postData['title'] || '',
        description: postData['description'] || '',
        authorId: postData['authorId'] || '',
        authorName: postData['authorName'] || '',
        createdAt: postData['createdAt'] || '',
        likes: postData['likes'] || 0,
        dislikes: postData['dislikes'] || 0,
        replyCount: postData['replyCount'] || 0
      };
      posts.push(post);
    });
    
    posts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    for (const post of posts) {
      if (post.id) {
        const replies = await this.getReplies(post.id);
        post.replies = replies;
        post.replyCount = replies.length;
      }
    }
    
    return posts;
  }

  getPosts$(): Observable<ForumPost[]> {
    return from(this.getPosts());
  }

  async addReply(postId: string, content: string, authorId: string, authorName: string): Promise<string> {
    const replyId = doc(collection(this.firestore, 'forumReplies')).id;
    const replyRef = doc(this.firestore, 'forumReplies', replyId);
    const replyData = {
      postId: postId,
      content: content.trim(),
      authorId: authorId,
      authorName: authorName || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    
    await setDoc(replyRef, replyData);
    
    const postRef = doc(this.firestore, 'forumPosts', postId);
    await updateDoc(postRef, {
      replyCount: increment(1)
    });
    
    return replyId;
  }

  async getReplies(postId: string): Promise<ForumReply[]> {
    const repliesRef = collection(this.firestore, 'forumReplies');
    const q = query(repliesRef, where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    
    const replies: ForumReply[] = [];
    querySnapshot.forEach((docSnap) => {
      const replyData = docSnap.data();
      replies.push({
        id: docSnap.id,
        postId: replyData['postId'] || '',
        content: replyData['content'] || '',
        authorId: replyData['authorId'] || '',
        authorName: replyData['authorName'] || '',
        createdAt: replyData['createdAt'] || ''
      });
    });
    
    replies.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
    
    return replies;
  }

  async likePost(postId: string, userId: string, type: 'like' | 'dislike'): Promise<void> {
    const likeRef = doc(this.firestore, `forumLikes/${userId}_${postId}`);
    const likeSnap = await getDoc(likeRef);
    
    const postRef = doc(this.firestore, `forumPosts/${postId}`);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postSnap.data() as ForumPost;
    let likesDelta = 0;
    let dislikesDelta = 0;
    
    if (likeSnap.exists()) {
      const existingLike = likeSnap.data() as PostLike;
      
      if (existingLike.type === type) {
        await deleteDoc(likeRef);
        if (type === 'like') {
          likesDelta = -1;
        } else {
          dislikesDelta = -1;
        }
      } else {
        await updateDoc(likeRef, { type });
        if (type === 'like') {
          likesDelta = 1;
          dislikesDelta = -1;
        } else {
          likesDelta = -1;
          dislikesDelta = 1;
        }
      }
    } else {
      await setDoc(likeRef, {
        userId,
        postId,
        type
      });
      if (type === 'like') {
        likesDelta = 1;
      } else {
        dislikesDelta = 1;
      }
    }
    
    const updates: any = {};
    if (likesDelta !== 0) {
      updates.likes = increment(likesDelta);
    }
    if (dislikesDelta !== 0) {
      updates.dislikes = increment(dislikesDelta);
    }
    
    await updateDoc(postRef, updates);
  }

  async getUserLikeStatus(postId: string, userId: string): Promise<'like' | 'dislike' | null> {
    const likeRef = doc(this.firestore, `forumLikes/${userId}_${postId}`);
    const likeSnap = await getDoc(likeRef);
    
    if (likeSnap.exists()) {
      const likeData = likeSnap.data() as PostLike;
      return likeData.type;
    }
    
    return null;
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const repliesRef = collection(this.firestore, 'forumReplies');
      const repliesQuery = query(repliesRef, where('postId', '==', postId));
      const repliesSnapshot = await getDocs(repliesQuery);
      
      const deletePromises: Promise<void>[] = [];
      repliesSnapshot.forEach((replyDoc) => {
        deletePromises.push(deleteDoc(doc(this.firestore, 'forumReplies', replyDoc.id)));
      });

      const likesRef = collection(this.firestore, 'forumLikes');
      const likesSnapshot = await getDocs(likesRef);
      
      likesSnapshot.forEach((likeDoc) => {
        const likeData = likeDoc.data() as PostLike;
        if (likeData.postId === postId) {
          deletePromises.push(deleteDoc(doc(this.firestore, 'forumLikes', likeDoc.id)));
        }
      });
      
      await Promise.all(deletePromises);

      const postRef = doc(this.firestore, 'forumPosts', postId);
      await deleteDoc(postRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async deleteReply(replyId: string, postId: string): Promise<void> {
    try {
      const replyRef = doc(this.firestore, 'forumReplies', replyId);
      await deleteDoc(replyRef);
      const postRef = doc(this.firestore, 'forumPosts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data() as ForumPost;
        const newReplyCount = Math.max(0, (postData.replyCount || 0) - 1);
        await updateDoc(postRef, {
          replyCount: newReplyCount
        });
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  }
}

