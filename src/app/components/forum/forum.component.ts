import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DarkModeService } from '../dark-mode-service';
import { AuthService } from '../../auth.service';
import { UserService } from '../../services/user.service';
import { ForumService, ForumPost, ForumReply } from '../../services/forum.service';
import { LucideAngularModule, ThumbsUp, ThumbsDown, MessageCircle, Globe, Pencil } from 'lucide-angular';
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
  loading = true;
  showPostForm = false;
  postTitle = '';
  postDescription = '';
  replyingTo: string | null = null;
  replyContent: string = '';
  currentUser: any = null;
  currentUserName: string = '';
  userLikeStatus: Map<string, 'like' | 'dislike' | null> = new Map();
  expandedPosts: Set<string> = new Set();
  
  private authSubscription?: Subscription;
  
  readonly ThumbsUpIcon = ThumbsUp;
  readonly ThumbsDownIcon = ThumbsDown;
  readonly MessageCircleIcon = MessageCircle;
  readonly GlobeIcon = Globe;
  readonly PencilIcon = Pencil;

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
    const userData = await this.userService.getUser(this.currentUser.uid);
    this.currentUserName = userData?.username || this.currentUser.displayName || (this.currentUser.email ? this.currentUser.email.split('@')[0] : 'Anonymous');
  }

  async loadPosts() {
    this.loading = true;
    this.posts = await this.forumService.getPosts();
    
    if (this.currentUser) {
      for (const post of this.posts) {
        if (post.id) {
          const status = await this.forumService.getUserLikeStatus(post.id, this.currentUser.uid);
          this.userLikeStatus.set(post.id, status);
        }
      }
    }
    
    this.loading = false;
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
}

