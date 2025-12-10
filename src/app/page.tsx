import Link from 'next/link';
import { getAllPosts } from '@/lib/content/reader';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-16">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            My Blog
          </h1>
          <p className="text-gray-500">
            Thoughts on technology, architecture, and simplicity.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article key={post.slug}>
                <Link
                  href={`/${post.year}/${post.month}/${post.slug}`}
                  className="group block"
                >
                  <time className="text-sm text-gray-400">
                    {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <h2 className="text-xl font-medium text-gray-900 mt-1 group-hover:text-blue-600 transition-colors">
                    {post.frontmatter.title}
                  </h2>
                  {post.frontmatter.subtitle && (
                    <p className="text-gray-500 mt-1">
                      {post.frontmatter.subtitle}
                    </p>
                  )}
                  {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {post.frontmatter.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
