import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DarkModeService } from '../dark-mode-service';
import { AuthService } from '../../auth.service';
import { UserService, UserData } from '../../services/user.service';
import { ForumService, ForumPost, ForumReply } from '../../services/forum.service';
import { LucideAngularModule, ThumbsUp, ThumbsDown, MessageCircle, Globe, Pencil, Trash2, Search } from 'lucide-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit, OnDestroy {
  posts: ForumPost[] = [];
  allPosts: ForumPost[] = [];
  loading = true;
  showPostForm = false;
  postTitle = '';
  postDescription = '';
  replyingTo: string | null = null;
  replyContent: string = '';
  searchTerm = '';
  currentUser: any = null;
  currentUserName: string = '';
  currentUserData: UserData | null = null;
  isAdmin = false;
  userLikeStatus: Map<string, 'like' | 'dislike' | null> = new Map();
  expandedPosts: Set<string> = new Set();
  
  private authSubscription?: Subscription;
  
  readonly ThumbsUpIcon = ThumbsUp;
  readonly ThumbsDownIcon = ThumbsDown;
  readonly MessageCircleIcon = MessageCircle;
  readonly GlobeIcon = Globe;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly SearchIcon = Search;

  constructor(
    public darkModeService: DarkModeService,
    private authService: AuthService,
    private userService: UserService,
    private forumService: ForumService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(async (user) => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      await this.loadUserData();
      await this.loadPosts();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async loadUserData() {
    if (!this.currentUser) return;
    this.currentUserData = await this.userService.getUser(this.currentUser.uid);
    this.currentUserName = this.currentUserData?.username || this.currentUser.displayName || (this.currentUser.email ? this.currentUser.email.split('@')[0] : 'Anonymous');
    this.isAdmin = this.currentUserData?.role === 'admin';
  }

  async loadPosts() {
    this.loading = true;
    this.allPosts = await this.forumService.getPosts();
    
    if (this.currentUser) {
      for (const post of this.allPosts) {
        if (post.id) {
          const status = await this.forumService.getUserLikeStatus(post.id, this.currentUser.uid);
          this.userLikeStatus.set(post.id, status);
        }
      }
    }
    
    this.applySearch();
    this.loading = false;
  }

  applySearch() {
    if (!this.searchTerm.trim()) {
      this.posts = this.allPosts;
      return;
    }

    const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
    this.posts = this.allPosts.filter((post: ForumPost) => {
      const titleMatch = post.title?.toLowerCase().includes(lowerSearchTerm);
      const authorNameMatch = post.authorName?.toLowerCase().includes(lowerSearchTerm);
      
      if (this.isAdmin) {
        const postIdMatch = post.id?.toLowerCase().includes(lowerSearchTerm);
        return titleMatch || authorNameMatch || postIdMatch;
      } else {
        return titleMatch || authorNameMatch;
      }
    });
  }

  onSearchChange() {
    this.applySearch();
  }

  async createPost() {
    if (!this.postTitle.trim() || !this.postDescription.trim() || !this.currentUser) {
      return;
    }

    const postId = await this.forumService.createPost(
      this.postTitle.trim(),
      this.postDescription.trim(),
      this.currentUser.uid,
      this.currentUserName || 'Anonymous'
    );
    
    this.postTitle = '';
    this.postDescription = '';
    this.showPostForm = false;
    await this.loadPosts();
  }

  async addReply(postId: string) {
    if (!this.replyContent.trim() || !this.currentUser) {
      return;
    }

    await this.forumService.addReply(
      postId,
      this.replyContent.trim(),
      this.currentUser.uid,
      this.currentUserName
    );
    
    this.replyContent = '';
    this.replyingTo = null;
    await this.loadPosts();
  }

  async toggleLike(postId: string, type: 'like' | 'dislike') {
    if (!this.currentUser || !postId) return;

    await this.forumService.likePost(postId, this.currentUser.uid, type);
    await this.loadPosts();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  togglePostForm() {
    this.showPostForm = !this.showPostForm;
    if (!this.showPostForm) {
      this.postTitle = '';
      this.postDescription = '';
    }
  }

  toggleComments(postId: string) {
    if (this.expandedPosts.has(postId)) {
      this.expandedPosts.delete(postId);
    } else {
      this.expandedPosts.add(postId);
    }
  }

  isExpanded(postId: string): boolean {
    return this.expandedPosts.has(postId);
  }

  startReply(postId: string) {
    this.replyingTo = postId;
    this.replyContent = '';

    if (!this.expandedPosts.has(postId)) {
      this.expandedPosts.add(postId);
    }
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyContent = '';
  }

  isLiked(postId: string): boolean {
    return this.userLikeStatus.get(postId) === 'like';
  }

  isDisliked(postId: string): boolean {
    return this.userLikeStatus.get(postId) === 'dislike';
  }

  async deletePost(post: ForumPost) {
    if (!post.id || !this.isAdmin) return;
    
    if (!confirm(`Are you sure you want to delete this post: "${post.title}"?`)) {
      return;
    }
    
    try {
      await this.forumService.deletePost(post.id);
      await this.loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  }

  async deleteReply(reply: ForumReply, post: ForumPost) {
    if (!reply.id || !post.id || !this.isAdmin) return;
    
    if (!confirm(`Are you sure you want to delete this reply?`)) {
      return;
    }
    
    try {
      await this.forumService.deleteReply(reply.id, post.id);
      await this.loadPosts();
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Error deleting reply. Please try again.');
    }
  }
}

