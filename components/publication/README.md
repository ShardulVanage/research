# Publication Component Structure

## Components

### CommentSection.jsx
A clean, reusable component for displaying and managing comments with nested reply support.

**Location:** `components/publication/CommentSection.jsx`

**Features:**
- ✅ Display comments with user avatars and profiles
- ✅ Nested comment replies (threaded conversations)
- ✅ Show/hide replies with collapsible threads
- ✅ Reply directly to any comment
- ✅ User profile links for all commenters
- ✅ Formatted dates with timestamps
- ✅ Edit indicator (shows when comment was edited)
- ✅ Dark mode support
- ✅ Loading states and error handling

**Props:**
```javascript
{
  publicationId: string,           // Publication ID
  currentUser: object,              // Current logged-in user
  comments: array,                  // All comments (flat array)
  commentsLoading: boolean,         // Loading state
  onSubmitComment: function,        // Callback when posting comment
  onSubmitReply: function,          // Callback when posting reply
  commentSubmitting: boolean        // Submission loading state
}
```

**Usage:**
```jsx
import { CommentSection } from "@/components/publication/CommentSection"

<CommentSection
  publicationId={id}
  currentUser={user}
  comments={comments}
  commentsLoading={commentsLoading}
  onSubmitComment={handleCommentSubmit}
  onSubmitReply={handleCommentReplySubmit}
  commentSubmitting={commentSubmitting}
/>
```

---

## Database Structure

### Comments Collection
- **Fields:**
  - `id`: Primary key
  - `publication`: Relation to publications
  - `user`: Relation to users (comment author)
  - `content`: Text content of comment
  - `parent_comment`: Relation to comments (for nested replies)
  - `created`: Auto-generated creation date
  - `updated`: Auto-generated update date

### How Nesting Works
- Top-level comments have `parent_comment` as empty
- Replies have `parent_comment` pointing to the comment they reply to
- The component queries all comments and organizes them by parent/child relationship

---

## API Functions (pocketbase.js)

### getComments(publicationId)
Fetches all comments for a publication with proper user expansion.
- Expands user data for comment author
- Expands user data for parent comment author (if nested)
- Limits to 500 comments per publication
- Sorted by creation date (oldest first)

```javascript
const result = await getComments(publicationId)
// Returns: { success: true, data: { items: [...], ... } }
```

### createComment(commentData)
Creates a top-level comment.

```javascript
const result = await createComment({
  publication: publicationId,
  user: userId,
  content: "Comment text"
})
```

### createCommentReply(publicationId, userId, content, parentCommentId)
Creates a nested reply to an existing comment.

```javascript
const result = await createCommentReply(
  publicationId,
  userId,
  "Reply text",
  parentCommentId
)
```

### deleteComment(commentId)
Deletes a comment (and potentially its replies based on cascade rules).

```javascript
const result = await deleteComment(commentId)
```

---

## Component Behavior

### Comment Display
1. Shows all top-level comments (parent_comment is empty)
2. Each comment displays:
   - User avatar (clickable link to profile)
   - User name/email (clickable link to profile)
   - Creation date with time
   - "(edited)" label if updated_at > created_at
   - Comment content
   - Reply count (if has replies)

### Threading
- Reply button on each comment
- Click "Reply" to expand reply form
- Nested replies shown under parent with indentation
- Replies collapsible with "Show/Hide replies" button
- Visual left border separates nested reply thread

### User Profiles
- All usernames are clickable links to user profile page
- Avatar images link to user profile
- Hover effects for better UX
- Displays initials in avatar background if no image

### Loading States
- Shows spinner while comments are loading
- Spinner on reply button while posting
- Disabled state while posting

### Empty State
- Shows message if no comments exist
- Encourages first comment with icon

---

## Styling

- Uses Tailwind CSS
- Full dark mode support with `dark:` classes
- Responsive design (mobile-friendly)
- Gradient avatars (cyan to blue) as fallback
- Consistent color scheme with publication detail page

---

## Future Enhancements

Potential features to add:
- [ ] Edit comments
- [ ] Delete comments (with confirmation)
- [ ] Like/upvote comments
- [ ] Comment search/filtering
- [ ] Mention users in comments (@username)
- [ ] Rich text editor (markdown)
- [ ] Pagination for very long comment threads
- [ ] Email notifications for replies
- [ ] Comment moderation/flagging
