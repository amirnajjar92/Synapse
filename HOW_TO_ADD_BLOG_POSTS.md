# How to Add New Blog Posts

## 🎯 Quick Method

### 1. Open the Blog Data File
```
/src/data/blog-posts.ts
```

### 2. Add Your Post to the Array
```typescript
export const blogPosts: BlogPost[] = [
  // ... existing posts ...
  
  // 👇 Add your new post here
  {
    slug: "your-post-slug",
    title: "Your Post Title",
    description: "SEO description (145-155 characters max)",
    excerpt: "Short summary for the card (200 characters max)",
    content: `
# Your Post Title

Your full blog post content goes here in Markdown format.

## Section Heading

Paragraph text with **bold** and regular text.

### Subsection

- Bullet point 1
- Bullet point 2
- Bullet point 3

More content here...
    `,
    date: "2025-01-20", // ISO format: YYYY-MM-DD
    author: {
      name: "Your Name",
      avatar: "/avatars/your-name.jpg", // Optional
      bio: "Your bio (optional)"
    },
    tags: ["Tag1", "Tag2", "Tag3"], // 3-5 tags
    category: "Technology", // or "Training", "Nutrition", etc.
    featuredImage: "/blog/your-image.jpg", // Optional
    readTime: 5, // Estimated minutes
    metaTitle: "Custom SEO Title | Synapse Fit", // Optional
    metaDescription: "Custom SEO description", // Optional
    keywords: ["keyword1", "keyword2"], // Optional
    published: true, // Set false to hide
  },
];
```

### 3. Save and Refresh
The new post will appear immediately in development mode!

---

## 📝 Field Guide

### Required Fields

#### `slug` (string)
- URL-friendly identifier
- Use lowercase with hyphens
- Must be unique
- Example: `"complete-guide-to-protein-intake"`

#### `title` (string)
- Post headline
- 50-70 characters ideal
- Will be `<h1>` on the page
- Example: `"Complete Guide to Protein Intake for Muscle Growth"`

#### `description` (string)
- SEO meta description
- 145-155 characters (strict!)
- Appears in search results
- Should include main keyword
- Example: `"Learn exactly how much protein you need for muscle growth. Science-backed recommendations, timing strategies, and common mistakes to avoid."`

#### `excerpt` (string)
- Short summary for cards
- 150-200 characters
- Teases the content
- Example: `"Protein is essential for muscle growth, but how much do you really need? This guide covers optimal intake, timing, and sources."`

#### `content` (string)
- Full blog post in Markdown
- Use `##` for h2 headings
- Use `###` for h3 headings
- Use `**bold**` for emphasis
- Use `-` for bullet points
- Example:
```markdown
# Main Title (optional, title is used if omitted)

## Introduction

Your intro paragraph here.

## Section 1: Main Point

Content with **bold text** and regular text.

### Subsection

- Point 1
- Point 2
- Point 3

## Section 2: Another Point

More content...

## Conclusion

Wrap up your post.
```

#### `date` (string)
- ISO format: `"YYYY-MM-DD"`
- Example: `"2025-01-20"`

#### `author.name` (string)
- Author's full name
- Example: `"Dr. Sarah Chen"`

#### `tags` (string[])
- Array of 3-5 tags
- Will create filter buttons
- Use title case
- Example: `["Nutrition", "Muscle Building", "Protein", "Science"]`

#### `category` (string)
- Main category
- Options: `"Technology"`, `"Training"`, `"Nutrition"`, `"Recovery"`, `"Business"`
- Example: `"Nutrition"`

#### `readTime` (number)
- Estimated reading time in minutes
- Calculate: word count ÷ 200
- Example: `8`

#### `published` (boolean)
- `true` = visible on blog
- `false` = hidden (draft)
- Example: `true`

---

## 🎨 Optional Fields

#### `featuredImage` (string)
- URL or path to image
- Recommended: 1200x630px
- Will show as hero image
- Example: `"/blog/protein-guide.jpg"`
- If omitted: gradient placeholder will show

#### `author.avatar` (string)
- URL or path to author image
- Recommended: 200x200px, square
- Example: `"/avatars/sarah-chen.jpg"`
- If omitted: initials will show

#### `author.bio` (string)
- Short author description
- 1-2 sentences
- Example: `"Exercise Scientist & AI Fitness Researcher with 10 years experience"`

#### `metaTitle` (string)
- Custom SEO title (overrides default)
- Default: `{title} | Synapse Fit Blog`
- Use if you want different title for search engines
- Example: `"Protein Intake Guide 2025 | Synapse Fit"`

#### `metaDescription` (string)
- Custom SEO description (overrides `description`)
- Use if you want different text for search engines

#### `keywords` (string[])
- SEO keywords
- Example: `["protein intake", "muscle building", "nutrition guide"]`

---

## 🤖 Using the SEO Engine

### Generate Content Automatically

```bash
cd /Users/amirnajjar/synapse-seo-engine
source .venv/bin/activate

# Research keywords
python -m seo_engine.main research

# Generate blog content
python -m seo_engine.main content

# View generated posts
cat generated-content.json
```

### Copy Generated Content
1. Open `generated-content.json`
2. Find a post you like
3. Copy the structure
4. Paste into `/src/data/blog-posts.ts`
5. Adjust fields as needed

---

## ✍️ Writing Tips

### Title Best Practices
- Include main keyword
- Make it compelling
- 50-70 characters
- Use numbers when possible: "7 Ways to..."
- Use power words: "Complete", "Ultimate", "Essential"

### Description Best Practices
- Start with main keyword
- Include a benefit
- Add a call to action
- Stay under 155 characters
- Make it enticing to click

### Content Best Practices
- Start with a hook (problem or question)
- Use short paragraphs (2-3 sentences)
- Break up with headings every 300 words
- Use bullet points for lists
- Include examples
- End with actionable takeaways
- Link to Synapse features when relevant

### Heading Structure
```
# Post Title (h1) - automatic
## Main Sections (h2) - creates TOC
### Subsections (h3) - details
```

### Markdown Formatting
```markdown
**bold text**
*italic text* (optional, rarely needed)
- bullet point
1. numbered list

[link text](https://url.com)

> Blockquote (optional)
```

---

## 📊 SEO Optimization

### Title Optimization
- Include target keyword
- Front-load important words
- Make it unique
- Match search intent

### Description Optimization
- Include target keyword naturally
- Promise value to reader
- Match title promise
- Use active voice

### Content Optimization
- Use keyword in first paragraph
- Use keyword in at least one h2
- Include related keywords naturally
- Add internal links to other posts
- Add internal links to Synapse features

### Tags Optimization
- Use 3-5 tags
- Include target keyword as a tag
- Use consistent tags across similar posts
- Create tag clusters (e.g., all "AI" posts)

---

## 🖼️ Adding Images

### Featured Images
1. Create image (1200x630px recommended)
2. Save to `/public/blog/`
3. Name descriptively: `protein-intake-guide.jpg`
4. Reference in post: `featuredImage: "/blog/protein-intake-guide.jpg"`

### Author Avatars
1. Create square image (200x200px)
2. Save to `/public/avatars/`
3. Name: `author-name.jpg`
4. Reference: `author.avatar: "/avatars/author-name.jpg"`

### Image Best Practices
- Use WebP format for smaller size
- Compress images (TinyPNG, ImageOptim)
- Use descriptive filenames
- Always provide alt text in post content

---

## 🚀 Publishing Workflow

### 1. Draft Phase
```typescript
{
  // ... post fields ...
  published: false, // Hidden from public
}
```

### 2. Review Phase
- Check spelling and grammar
- Verify all links work
- Test readability
- Get feedback

### 3. Publish Phase
```typescript
{
  // ... post fields ...
  published: true, // Now visible!
}
```

### 4. Post-Publish
- Share on social media
- Monitor analytics
- Update if needed
- Link from related posts

---

## 📁 File Structure

```
/src/data/blog-posts.ts
  ↓ Contains all posts

/src/app/blog/
  ↓ Blog pages

/public/blog/
  ↓ Featured images

/public/avatars/
  ↓ Author images
```

---

## 🎯 Examples

### Short Post (5 min read)
```typescript
{
  slug: "quick-warm-up-routine",
  title: "5-Minute Warm-Up Routine You Can Do Anywhere",
  description: "Quick and effective warm-up exercises to prevent injury and boost performance. Perfect for busy schedules.",
  excerpt: "Don't skip your warm-up! This 5-minute routine prepares your body for any workout.",
  content: `
## Why Warm Up?

Warming up prevents injury and improves performance.

## The 5-Minute Routine

### Jumping Jacks (1 min)
- Increases heart rate
- Warms up full body

### Arm Circles (30 sec)
- Loosens shoulders
- Improves mobility

// ... more exercises ...
  `,
  date: "2025-01-20",
  author: { name: "Coach Mike" },
  tags: ["Warm-Up", "Quick Tips", "Training"],
  category: "Training",
  readTime: 5,
  published: true,
}
```

### Long Post (10 min read)
```typescript
{
  slug: "complete-guide-to-progressive-overload",
  title: "Complete Guide to Progressive Overload: Build Muscle Systematically",
  description: "Master progressive overload with this comprehensive guide. Learn principles, methods, tracking, and common mistakes to maximize muscle growth.",
  excerpt: "Progressive overload is the cornerstone of muscle building. Learn how to apply it systematically for continuous gains.",
  content: `
## What is Progressive Overload?

Progressive overload is the gradual increase of stress...

## The Science Behind It

Research shows that muscles adapt when...

## 7 Methods of Progressive Overload

### 1. Increase Weight
The most common method...

### 2. Increase Reps
When you can perform...

// ... more sections ...

## Common Mistakes to Avoid

### Mistake 1: Progressing Too Fast
Many beginners...

## Conclusion

Progressive overload is not optional...
  `,
  date: "2025-01-20",
  author: {
    name: "Dr. Sarah Chen",
    bio: "Exercise Scientist specializing in hypertrophy"
  },
  tags: ["Muscle Building", "Progressive Overload", "Training Science", "Strength"],
  category: "Training",
  featuredImage: "/blog/progressive-overload.jpg",
  readTime: 10,
  published: true,
}
```

---

## 🐛 Troubleshooting

### Post not showing
- Check `published: true`
- Check date format
- Refresh page (Cmd+R)
- Check console for errors

### Formatting looks wrong
- Check Markdown syntax
- Use `##` not `#` for sections
- Close all formatting tags

### SEO fields not working
- Check field spelling
- Ensure strings have quotes
- View page source to verify

### Related posts not showing
- Check tags match other posts
- Check category matches
- Ensure other posts published

---

## 📚 Resources

### Markdown Guide
- https://www.markdownguide.org/basic-syntax/

### SEO Best Practices
- https://moz.com/learn/seo/title-tag
- https://backlinko.com/meta-description

### Content Writing
- https://copyblogger.com/magnetic-headlines/
- https://blog.hubspot.com/marketing/how-to-write-a-blog-post

---

## ✅ Checklist for New Posts

Before publishing:
- [ ] Slug is unique and URL-friendly
- [ ] Title is 50-70 characters
- [ ] Description is 145-155 characters
- [ ] Excerpt is compelling
- [ ] Content is well-structured with h2/h3
- [ ] Date is correct format
- [ ] Author name is correct
- [ ] 3-5 relevant tags
- [ ] Category is correct
- [ ] Read time is accurate
- [ ] `published: true`
- [ ] No TypeScript errors
- [ ] Preview looks good
- [ ] SEO tags are correct (view source)

---

**Now you're ready to create amazing blog content! 🚀**
