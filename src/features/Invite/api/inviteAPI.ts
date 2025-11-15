import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { Channel, ReferralLinkResponse } from '../types/invite';

/**
 * 🔗 Fetch the user's referral link.
 * Optionally accepts a channel (sms | whatsapp | email)
 * so backend can return channel-specific share text.
 */
export async function fetchReferralLinkAPI(channel?: Channel): Promise<ReferralLinkResponse> {
  try {
    const url = buildRoute.referralLink(channel);
    const { data } = await api.get<ReferralLinkResponse>(url);
    return data;
  } catch (error: any) {
    console.error('❌ fetchReferralLinkAPI error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * ♻️ Rotate (regenerate) a new referral link.
 * Returns the same shape as fetchReferralLinkAPI.
 */
export async function rotateReferralLinkAPI(): Promise<ReferralLinkResponse> {
  try {
    const url = buildRoute.rotateReferralLink();
    const { data } = await api.post<ReferralLinkResponse>(url);
    return data;
  } catch (error: any) {
    console.error('❌ rotateReferralLinkAPI error:', error.response?.data || error.message);
    throw error;
  }
}
