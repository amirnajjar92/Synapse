import { BlogStoreProvider } from './BlogStore';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <BlogStoreProvider>{children}</BlogStoreProvider>;
}
