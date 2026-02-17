
interface ETrustedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ETrustedReview {
  id: string;
  submittedAt: string;
  rating: number;
  title?: string;
  comment?: string;
  customerName?: string;
  reply?: {
    comment: string;
    createdAt: string;
  };
}

interface ETrustedReviewsResponse {
  items: ETrustedReview[];
  paging?: {
    count: number;
    cursor?: string;
  };
}

interface ReviewInvitationRequest {
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  orderReference: string;
  orderDate: string;
  products?: Array<{
    name: string;
    sku?: string;
    url?: string;
    imageUrl?: string;
  }>;
}

class ETrustedService {
  private clientId: string;
  private clientSecret: string;
  private channelId: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private readonly AUTH_URL = 'https://login.etrusted.com/oauth/token';
  private readonly API_BASE = 'https://api.etrusted.com';

  constructor() {
    this.clientId = process.env.ETRUSTED_CLIENT_ID || '';
    this.clientSecret = process.env.ETRUSTED_CLIENT_SECRET || '';
    this.channelId = process.env.TRUSTED_SHOPS_ID || '';

    if (!this.clientId || !this.clientSecret) {
      console.warn('[eTrusted] Missing credentials - service will be disabled');
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      audience: 'https://api.etrusted.com',
    });

    const response = await fetch(this.AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[eTrusted] Auth failed:', response.status, errorText);
      throw new Error(`eTrusted authentication failed: ${response.status}`);
    }

    const data = await response.json() as ETrustedTokenResponse;
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return this.accessToken;
  }

  async getServiceReviews(limit: number = 10): Promise<ETrustedReview[]> {
    if (!this.clientId || !this.clientSecret) {
      return [];
    }

    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.API_BASE}/reviews?channelId=${this.channelId}&count=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[eTrusted] Failed to fetch reviews:', response.status, errorText);
        return [];
      }

      const data = await response.json() as ETrustedReviewsResponse;
      return data.items || [];
    } catch (error) {
      console.error('[eTrusted] Error fetching reviews:', error);
      return [];
    }
  }

  async getAggregatedRating(): Promise<{ rating: number; count: number } | null> {
    if (!this.clientId || !this.clientSecret) {
      return null;
    }

    try {
      const reviews = await this.getServiceReviews(100);
      if (reviews.length === 0) {
        return null;
      }
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      return {
        rating: Math.round(avgRating * 100) / 100,
        count: reviews.length,
      };
    } catch (error) {
      console.error('[eTrusted] Error calculating aggregate:', error);
      return null;
    }
  }

  async sendReviewInvitation(data: ReviewInvitationRequest): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('[eTrusted] Cannot send invitation - service not fully configured');
      return false;
    }

    try {
      const token = await this.getAccessToken();

      const payload = {
        type: 'checkout',
        defaultLocale: 'nl_NL',
        system: 'caraudiolimburg-webshop',
        systemVersion: '1.0',
        channel: {
          id: this.channelId,
          type: 'etrusted',
        },
        transaction: {
          reference: data.orderReference,
          date: data.orderDate,
        },
        consumer: {
          email: data.customerEmail,
          firstname: data.customerFirstName || '',
          lastname: data.customerLastName || '',
        },
        products: data.products?.map(p => ({
          name: p.name,
          sku: p.sku || '',
          url: p.url || '',
          imageUrl: p.imageUrl || '',
        })) || [],
      };

      const response = await fetch(`${this.API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[eTrusted] Failed to send invitation:', response.status, errorText);
        return false;
      }

      console.log('[eTrusted] Review invitation sent for order:', data.orderReference);
      return true;
    } catch (error) {
      console.error('[eTrusted] Error sending invitation:', error);
      return false;
    }
  }

  getTrustbadgeConfig(): { channelId: string; enabled: boolean } {
    return {
      channelId: this.channelId,
      enabled: !!this.channelId,
    };
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.channelId);
  }
}

export const etrustedService = new ETrustedService();
