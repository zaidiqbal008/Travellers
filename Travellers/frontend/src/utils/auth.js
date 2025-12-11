// Simple authentication utility for managing user sessions
class AuthService {
  constructor() {
    this.currentUser = this.getCurrentUser();
  }

  // Get current user from localStorage
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Set current user
  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Get user ID
  getUserId() {
    return this.currentUser?._id || null;
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.currentUser;
  }

  // Logout
  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // Create a demo user for testing
  createDemoUser() {
    const demoUser = {
      _id: 'demo_user_' + Date.now(),
      username: 'demo_customer',
      email: 'demo@example.com',
      userType: 'customer',
      phone: '03001234567'
    };
    this.setCurrentUser(demoUser);
    return demoUser;
  }

  // Ensure user exists (create demo user if none)
  ensureUser() {
    if (!this.isLoggedIn()) {
      return this.createDemoUser();
    }
    return this.currentUser;
  }
}

export default new AuthService(); 