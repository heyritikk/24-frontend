import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private storage = localStorage; // use localStorage for persistence

  private decodeTokenPayload(): any | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payloadPart = token.split('.')[1];
      const decodedJson = atob(payloadPart);
      return JSON.parse(decodedJson);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.storage.getItem('token');
  }

  getRole(): string | null {
    const storedRole = this.storage.getItem('role');
    if (storedRole) {
      return storedRole;
    }

    // Fallback: try to read role from JWT if not explicitly stored
    const payload = this.decodeTokenPayload();
    if (!payload) {
      return null;
    }

    return payload['role'] || payload['Role'] || null;
  }

  getEmail(): string | null {
    return this.storage.getItem('email');
  }

  getUserId(): string | null {
    const storedId = this.storage.getItem('userId');
    if (storedId) {
      return storedId;
    }

    const payload = this.decodeTokenPayload();
    if (!payload) {
      return null;
    }

    return payload['userId']?.toString() || payload['sub']?.toString() || null;
  }

  getUserName(): string | null {
    const payload = this.decodeTokenPayload();

    const nameFromToken =
      payload?.['name'] ||
      payload?.['fullName'] ||
      payload?.['given_name'] ||
      payload?.['username'];

    if (typeof nameFromToken === 'string' && nameFromToken.trim().length > 0) {
      return nameFromToken.trim();
    }

    const email = this.getEmail();
    if (!email) {
      return null;
    }

    const localPart = email.split('@')[0];
    if (!localPart) {
      return email;
    }

    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setSession(token: string, email: string, role: string, userId?: string) {
    this.storage.setItem('token', token);
    this.storage.setItem('email', email);
    this.storage.setItem('role', role);
    if (userId) {
      this.storage.setItem('userId', userId);
    }
  }

  clearSession() {
    this.storage.removeItem('token');
    this.storage.removeItem('email');
    this.storage.removeItem('role');
    this.storage.removeItem('userId');
  }

  logout() {
    this.clearSession();
  }
}

