export default function Home() {
  if (typeof window !== 'undefined') window.location.href = '/dashboard';
  return null;
}
