"use client";

import React, { useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([ // placeholder posts
    {
      id: 1,
      title: "Welcome to the Celo Europe Blog",
      author: "Celo EU Team",
      date: "2025-05-04",
      content: "This is the beginning of our community blog. Stay tuned for insights, updates, and contributor stories."
    },
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Celo Europe Blog</h1>
      <p className="text-center text-gray-600 mb-10">
        A collaborative space for sharing stories, insights, and developments across the Celo EU community.
      </p>

      <div className="flex justify-center mb-8">
        <Link href="/blog/new" className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
          ✍️ Submit a New Article
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded shadow-md border border-gray-200">
              <h2 className="text-xl font-bold mb-1">{post.title}</h2>
              <p className="text-sm text-gray-500 mb-2">By {post.author} • {post.date}</p>
              <p className="text-gray-700 line-clamp-3">{post.content}</p>
              <Link href={`/blog/${post.id}`} className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                Read More →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No blog posts yet. Be the first to share!</p>
      )}
    </div>
  );
}
