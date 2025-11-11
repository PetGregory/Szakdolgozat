import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DarkModeService } from '../dark-mode-service';
import { AuthService } from '../../auth.service';
import { UserService, UserData } from '../../services/user.service';
import { ForumService, ForumPost, ForumReply } from '../../services/forum.service';
import { LucideAngularModule, Search, Trash2, Users, MessageSquare } from 'lucide-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentUserData: UserData | null = null;
  isAdminUser = false;
  
  searchTerm = '';
  forumSearchTerm = '';
  users: UserData[] = [];
  filteredUsers: UserData[] = [];
  loadingUsers = false;
  
  posts: ForumPost[] = [];
  allPosts: ForumPost[] = [];
  loadingPosts = false;
  activeTab: 'users' | 'forum' = 'users';
  
  private authSubscription?: Subscription;
  
  readonly SearchIcon = Search;
  readonly TrashIcon = Trash2;
  readonly UsersIcon = Users;
  readonly MessageSquareIcon = MessageSquare;

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
      
      this.currentUserData = await this.userService.getUser(user.uid);
      this.isAdminUser = this.currentUserData?.role === 'admin';
      
      if (!this.isAdminUser) {
        this.router.navigate(['/home']);
        return;
      }
      
      if (this.activeTab === 'users') {
        await this.loadUsers();
      } else {
        await this.loadPosts();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async loadUsers() {
    this.loadingUsers = true;
    try {
      this.users = await this.userService.getAllUsers();
      this.filteredUsers = this.users;
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loadingUsers = false;
    }
  }

  async searchUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }
    
    this.loadingUsers = true;
    try {
      this.filteredUsers = await this.userService.searchUsers(this.searchTerm);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      this.loadingUsers = false;
    }
  }

  onSearchChange() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
    } else {
      this.searchUsers();
    }
  }

  async deleteUser(user: UserData) {
    if (!user?.id) return;
    
    // Prevent deleting admin users
    if (user.role === 'admin') {
      alert('Cannot delete admin users.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete user "${user.username || user.email}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await this.userService.deleteUser(user.id);
      this.users = this.users.filter(u => u.id !== user.id);
      this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  }

  async loadPosts() {
    this.loadingPosts = true;
    try {
      this.allPosts = await this.forumService.getPosts();
      this.applyForumSearch();
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      this.loadingPosts = false;
    }
  }

  applyForumSearch() {
    if (!this.forumSearchTerm.trim()) {
      this.posts = this.allPosts;
      return;
    }
    const lowerSearchTerm = this.forumSearchTerm.toLowerCase().trim();
    this.posts = this.allPosts.filter((post: ForumPost) => {
      const titleMatch = post.title?.toLowerCase().includes(lowerSearchTerm);
      const authorNameMatch = post.authorName?.toLowerCase().includes(lowerSearchTerm);
      const postIdMatch = post.id?.toLowerCase().includes(lowerSearchTerm);
      return titleMatch || authorNameMatch || postIdMatch;
    });
  }

  onForumSearchChange() {
    this.applyForumSearch();
  }

  async deletePost(post: ForumPost) {
    if (!post.id) return;
    
    if (!confirm(`Are you sure you want to delete this post: "${post.title}"?`)) {
      return;
    }
    
    try {
      await this.forumService.deletePost(post.id);
      this.allPosts = this.allPosts.filter(p => p.id !== post.id);
      this.applyForumSearch();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  }

  async deleteReply(reply: ForumReply, post: ForumPost) {
    if (!reply.id || !post.id) return;
    
    if (!confirm(`Are you sure you want to delete this reply?`)) {
      return;
    }
    
    try {
      await this.forumService.deleteReply(reply.id, post.id);
      await this.loadPosts();
      this.applyForumSearch();
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Error deleting reply. Please try again.');
    }
  }

  switchTab(tab: 'users' | 'forum') {
    this.activeTab = tab;
    if (tab === 'users') {
      this.loadUsers();
    } else {
      this.loadPosts();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}

