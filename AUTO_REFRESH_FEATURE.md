# Auto-Refresh Feature

## Overview
The website now automatically detects and displays new items **without requiring a page refresh**. When someone posts a new lost or found item, other users browsing the site will see a notification button that they can click to instantly see the new content.

## How It Works

### 1. **Background Polling**
- The website checks for new items every **30 seconds** on `/lost` and `/found` pages
- The homepage checks every **15 seconds**
- Polling only happens when the page is visible (pauses when tab is in background to save resources)

### 2. **Smart Notification**
- When new items are detected, a **blue notification button** appears
- The button shows: "X new items - Click to refresh"
- The notification auto-hides after 5 seconds if not clicked
- Clicking the button instantly loads the new items without a full page reload

### 3. **Zero Configuration**
- No database changes needed
- No server restarts required
- Works automatically on all pages

## Files Added/Modified

### New Files Created:
- `components/auto-refresh-items.tsx` - Auto-refresh component
- `app/api/items/count/route.ts` - API endpoint to count items

### Modified Files:
- `app/lost/page.tsx` - Added auto-refresh for lost items
- `app/found/page.tsx` - Added auto-refresh for found items
- `app/page.tsx` - Added auto-refresh for homepage
- `app/globals.css` - Added `.input` CSS class

## Technical Details

### API Endpoint
```
GET /api/items/count
```

Returns:
```json
{
  "count": 42
}
```

### Component Props
```typescript
<AutoRefreshItems 
  onNewItems={(count) => { /* handle new items */ }}
  interval={30000} // milliseconds (default: 30s)
/>
```

### Features:
- **Intersection Observer**: Pauses polling when tab is not visible
- **Efficient**: Only fetches item count, not full data
- **User-friendly**: Shows notification only when there are new items
- **Smooth**: No page flicker or reload

## Benefits

1. **Real-time Updates**: Users see new items almost instantly (within 30 seconds)
2. **No User Action Required**: Works automatically in the background
3. **Performance Optimized**: Pauses when tab is hidden to save server resources
4. **Non-intrusive**: Gentle notification that doesn't disrupt browsing
5. **Mobile-Friendly**: Works on all devices and screen sizes

## Customization

### Change Polling Interval
Edit the interval prop in any page:

```typescript
// Check every 10 seconds instead of 30
<AutoRefreshItems onNewItems={handleNewItems} interval={10000} />
```

### Disable Auto-Refresh
Simply remove the `<AutoRefreshItems>` component from any page.

### Change Notification Duration
Edit the setTimeout in the `handleNewItems` function:

```typescript
// Auto-hide after 3 seconds instead of 5
setTimeout(() => {
  setShowNotification(false);
}, 3000);
```

## Testing

To test the feature:

1. Open the website in two browser tabs
2. In Tab 1: Go to `/lost` or `/found`
3. In Tab 2: Report a new item
4. Wait up to 30 seconds (or the polling interval)
5. Tab 1 should show a notification: "1 new item - Click to refresh"
6. Click the button to see the new item instantly

## Future Enhancements (Optional)

- Use **WebSockets** for truly real-time updates (requires server setup)
- Add sound notification for new items
- Allow users to customize polling interval
- Show preview of new items in notification
- Add badge count on navigation items

## Troubleshooting

**Issue**: Not seeing new items
- **Solution**: Wait for the polling interval (30 seconds max)
- **Solution**: Click the notification button to force refresh
- **Solution**: Check browser console for errors

**Issue**: Too many API calls
- **Solution**: Increase the interval (e.g., to 60000 for 1 minute)
- **Solution**: The feature already pauses when tab is hidden

## Notes

- The polling is **client-side only**, so it works with Vercel's free tier
- No additional server resources are consumed
- The feature is **progressive** - if JavaScript is disabled, the site still works normally, just without auto-refresh
- All existing functionality remains unchanged
