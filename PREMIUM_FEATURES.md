# 💎 PeptideLog Premium Features Roadmap

> **Last Updated:** January 5, 2026  
> **Version:** 2.0  
> **Status:** Planning Phase (Ready for Implementation)  
> **Stripe Integration:** ✅ Ready (not yet activated)

This document outlines the planned premium features for PeptideLog, with specific implementation details tied to the existing codebase.

---

## 📊 Subscription Tiers Overview

| Tier | Monthly | Annual (20% off) | Target User |
|------|---------|------------------|-------------|
| **Free** | $0 | $0 | Casual users, newcomers |
| **Premium** | $9.99 | $95.88 | Serious enthusiasts |
| **Pro** | $19.99 | $191.88 | Coaches, practitioners, power users |

---

## 🔧 Current Implementation Status

### Existing Infrastructure

- ✅ `paymentService.js` - Tier definitions, subscription checking
- ✅ `SUBSCRIPTION_TIERS` - Defined with limits
- ✅ Stripe account configured
- ✅ Supabase database ready
- ⏳ Checkout flow - Placeholder (ready for Stripe)
- ⏳ Feature gating - Not yet implemented

### Database Columns Needed

```sql
-- Add to profiles table (may already exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
```

---

## 🆓 Free Tier Features

Available to all users without a subscription:

| Feature | Limit | File |
|---------|-------|------|
| Injection tracking | 50 total | `useInjections.js` |
| Schedules | 5 active | `useSchedule.js` |
| Saved calculations | 10 total | `ReconstitutionCalculator.jsx` |
| Peptide encyclopedia | Read-only | `PeptideEncyclopedia.jsx` |
| Community reviews | Read-only | `ReviewSection.jsx` |
| Price checker | Current prices | `PriceChecker.jsx` |
| History view | 30 days | `InjectionLog.jsx` |
| Half-life plotter | Basic | `HalfLifePlotter.jsx` |

---

## ⭐ Premium Tier ($9.99/month)

### 1. Unlimited Tracking

**Priority:** 🔴 HIGH | **Effort:** ⬇️ LOW | **Status:** Ready to implement

Remove all usage limits:

- ✅ Unlimited injection logs
- ✅ Unlimited schedules  
- ✅ Unlimited saved calculations

**Implementation:**

```javascript
// In useInjections.js - add before adding injection
const { tier } = await paymentService.getSubscriptionStatus(userId);
if (tier === 'free' && injections.length >= 50) {
    throw new Error('LIMIT_REACHED');
}
```

**Files to modify:**

- `src/hooks/useInjections.js` - Add limit check in `addInjection`
- `src/hooks/useSchedule.js` - Add limit check in `addSchedule`
- `src/components/ReconstitutionCalculator.jsx` - Add limit check for saved calcs

---

### 2. Data Export

**Priority:** 🔴 HIGH | **Effort:** ⬇️ LOW | **Status:** Services exist

Export functionality to CSV, PDF, and Excel formats.

**Current state:**

- ✅ `exportService.js` - Core export logic exists
- ✅ `pdfService.js` - PDF generation ready
- ⏳ UI buttons need paywall gate

**Implementation:**

```javascript
// In Settings.jsx or DataManagement.jsx
import { paymentService } from '../services/paymentService';

const handleExport = async () => {
    const canExport = await paymentService.canAccessFeature(userId, 'data_export');
    if (!canExport) {
        showUpgradeModal('data_export');
        return;
    }
    // ... proceed with export
};
```

**Files to modify:**

- `src/components/DataManagement.jsx` - Gate export buttons
- `src/pages/Settings.jsx` - Gate export in data section

---

### 3. Extended History

**Priority:** 🟡 MEDIUM | **Effort:** ⬇️ LOW | **Status:** Ready

Unlimited history access (free users limited to 30 days).

**Implementation:**

```javascript
// In useInjections.js
const fetchInjections = async () => {
    const { tier } = await paymentService.getSubscriptionStatus(userId);
    
    let query = supabase.from('injections').select('*').eq('user_id', userId);
    
    if (tier === 'free') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('date', thirtyDaysAgo.toISOString());
    }
    
    return query;
};
```

**Files to modify:**

- `src/hooks/useInjections.js` - Add date filter for free users
- `src/components/InjectionLog.jsx` - Show "Unlock history" prompt

---

### 4. Write Reviews

**Priority:** 🟡 MEDIUM | **Effort:** ⬇️ LOW | **Status:** Ready

Free users can read reviews; Premium can write.

**Implementation:**

```javascript
// In ReviewSection.jsx
const canWriteReviews = await paymentService.canAccessFeature(userId, 'write_reviews');

{canWriteReviews ? (
    <ReviewForm onSubmit={handleSubmitReview} />
) : (
    <UpgradePrompt feature="write_reviews" />
)}
```

**Files to modify:**

- `src/components/ReviewSection.jsx` - Gate the review form

---

### 5. Price Drop Alerts

**Priority:** 🟡 MEDIUM | **Effort:** 🔶 MEDIUM | **Status:** Needs new backend

Get notified when tracked peptide prices drop.

**Database additions:**

```sql
CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    peptide_name TEXT NOT NULL,
    target_price DECIMAL,
    vendor_id UUID REFERENCES vendors(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_triggered_at TIMESTAMPTZ
);
```

**Backend work:**

- Supabase Edge Function to check prices against alerts
- Email/push notification integration
- UI for managing watchlist

**Files to create/modify:**

- `src/components/PriceAlerts.jsx` - New component
- `src/services/priceAlertService.js` - New service
- `supabase/functions/check-price-alerts/` - New edge function

---

### 6. Advanced Analytics

**Priority:** 🔴 HIGH | **Effort:** 🔶 MEDIUM | **Status:** Enhancement needed

Enhanced analytics with AI insights and extended charts.

**Current state:**

- ✅ `ProgressAnalytics.jsx` - Basic charts exist
- ⏳ Need advanced charts and insights

**Premium features to add:**

- Year-over-year comparison
- Goal tracking with milestones
- Compliance scoring
- Trend predictions
- Protocol effectiveness ratings

**Files to modify:**

- `src/components/ProgressAnalytics.jsx` - Add premium sections

---

### 7. Smart Notifications

**Priority:** 🟡 MEDIUM | **Effort:** 🔶 MEDIUM | **Status:** Enhancement needed

Custom reminder schedules, SMS, and email notifications.

**Current state:**

- ✅ `notificationService.js` - Basic push notifications
- ⏳ SMS/email need third-party integration

**Premium features to add:**

- Custom reminder times per peptide
- SMS reminders (Twilio integration)
- Email reminders (SendGrid/Supabase)
- Missed dose alerts
- Inventory low-stock warnings

**Third-party setup:**

- Twilio account for SMS
- SendGrid or use Supabase email triggers

**Files to modify:**

- `src/services/notificationService.js` - Add SMS/email methods
- `src/pages/Settings.jsx` - Add notification preferences

---

## 🏆 Pro Tier ($19.99/month)

*Includes all Premium features, plus:*

### 8. Multi-Profile Management

**Priority:** 🔴 HIGH | **Effort:** ⬆️ HIGH | **Status:** Needs major build

Track multiple stacks/protocols or manage clients.

**Database additions:**

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('personal', 'client')) DEFAULT 'personal',
    client_email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add profile_id to all user data tables
ALTER TABLE injections ADD COLUMN profile_id UUID REFERENCES user_profiles(id);
ALTER TABLE schedules ADD COLUMN profile_id UUID REFERENCES user_profiles(id);
ALTER TABLE inventory ADD COLUMN profile_id UUID REFERENCES user_profiles(id);
```

**UI changes:**

- Profile selector in navigation
- Profile management page
- All hooks filter by active profile

**Files to create:**

- `src/components/ProfileSelector.jsx`
- `src/pages/ProfileManagement.jsx`
- `src/context/ProfileContext.jsx`

**Files to modify:**

- All hooks to accept `profileId` parameter
- `Navigation.jsx` - Add profile selector

---

### 9. API Access

**Priority:** 🟡 MEDIUM | **Effort:** ⬆️ HIGH | **Status:** Needs backend build

RESTful API for developers and integrations.

**Backend setup:**

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    name TEXT,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);
```

**Edge functions needed:**

- `supabase/functions/api/` - Main API router
- Rate limiting (100 requests/hour)
- API key validation

**Files to create:**

- `src/pages/ApiSettings.jsx` - API key management
- `src/services/apiService.js` - Client-side helpers

---

### 10. Coach Dashboard

**Priority:** 🔴 HIGH | **Effort:** ⬆️ HIGH | **Status:** Major new feature

Manage multiple clients with protocol sharing.

**Features:**

- Client list management
- Real-time compliance monitoring
- Protocol templates
- White-label PDF reports
- Bulk messaging

**Database additions:**

```sql
CREATE TABLE coach_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE protocol_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    peptides JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Files to create:**

- `src/pages/admin/CoachDashboard.jsx`
- `src/components/ClientList.jsx`
- `src/components/ProtocolBuilder.jsx`
- `src/services/coachService.js`

---

### 11. Research Features

**Priority:** 🟢 LOW | **Effort:** 🔶 MEDIUM | **Status:** Content-heavy

Research summaries, interaction checker, clinical trial updates.

**Data sources:**

- PubMed API (free) for research papers
- Manual curation for interactions database
- DrugBank API (paid) for detailed interactions

**Files to create:**

- `src/components/ResearchPanel.jsx`
- `src/components/InteractionChecker.jsx`
- `src/services/researchService.js`

---

### 12. Priority Support

**Priority:** 🟢 LOW | **Effort:** ⬇️ LOW | **Status:** Ready

Pro users get priority in support queue.

**Implementation:**

```javascript
// In SupportTickets.jsx
const createTicket = async (ticket) => {
    const { tier } = await paymentService.getSubscriptionStatus(userId);
    const priority = tier === 'pro' ? 'high' : 'normal';
    
    await supabase.from('support_tickets').insert({
        ...ticket,
        priority
    });
};
```

**Files to modify:**

- `src/components/SupportTickets.jsx` - Auto-set priority
- `src/pages/admin/AdminTickets.jsx` - Sort by priority

---

## 🚀 Future Features (V2+)

### Blood Concentration Simulator

Half-life visualization with stacking overlap.

### AI Protocol Assistant

Natural language queries and personalized recommendations.

### Cycle Planning

Visual timeline builder with PCT scheduling.

### Health Integrations

Apple Health, Google Fit, wearable sync.

### Offline Mode

Full offline functionality with sync.

---

## 📋 Implementation Checklist

When you're ready to implement premium features:

### Phase 1: Foundation (1-2 weeks)

- [ ] Create `useSubscription` hook for easy tier checking
- [ ] Create `<PremiumGate>` wrapper component
- [ ] Add `showUpgradeModal()` utility
- [ ] Build pricing/upgrade page
- [ ] Connect Stripe Checkout
- [ ] Set up Stripe webhooks

### Phase 2: Gate Existing Features (1 week)

- [x] Add limit checks to `useInjections.js`
- [ ] Add limit checks to `useSchedule.js`
- [x] Gate export buttons in `DataManagement.jsx`
- [x] Gate review form in `ReviewSection.jsx`
- [ ] Add date filter for free user history
- [x] Enforce limits in `ReconstitutionCalculator.jsx`

### Phase 3: Build Premium Features (2-4 weeks)

- [ ] Price alerts system
- [ ] Enhanced analytics
- [ ] Smart notifications (SMS/email)

### Phase 4: Build Pro Features (4-8 weeks)

- [ ] Multi-profile system
- [ ] Coach dashboard
- [ ] API infrastructure

---

## 💰 Revenue Projections

| Users | Premium (2%) | Pro (0.5%) | Monthly Revenue |
|-------|--------------|------------|-----------------|
| 1,000 | 20 × $9.99 | 5 × $19.99 | $300 |
| 5,000 | 100 × $9.99 | 25 × $19.99 | $1,499 |
| 10,000 | 200 × $9.99 | 50 × $19.99 | $2,998 |
| 50,000 | 1,000 × $9.99 | 250 × $19.99 | $14,988 |
| 100,000 | 2,000 × $9.99 | 500 × $19.99 | $29,975 |

---

## 📁 Related Files

| Purpose | File |
|---------|------|
| Payment service | `src/services/paymentService.js` |
| Supabase client | `src/lib/supabase.js` |
| Export service | `src/services/exportService.js` |
| PDF service | `src/services/pdfService.js` |
| Notifications | `src/services/notificationService.js` |
| Analytics | `src/components/ProgressAnalytics.jsx` |
| Price checker | `src/components/PriceChecker.jsx` |
| Reviews | `src/components/ReviewSection.jsx` |
| Injection hook | `src/hooks/useInjections.js` |
| Schedule hook | `src/hooks/useSchedule.js` |

---

## 📝 Notes

- **Beta Access:** Consider free premium during beta to gather feedback
- **Lifetime Deal:** One-time purchase for early adopters (~$199-299)
- **Referral Program:** 1 free month per successful referral
- **Student Discount:** 50% off with `.edu` email verification
- **Annual Discount:** Standard 20% off (~2 months free)

---

*This roadmap will be updated as features are implemented.*
