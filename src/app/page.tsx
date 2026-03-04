import { redirect } from 'next/navigation';

export default function Home() {
  // Karena project ini hanya dashboard, bukan landing page,
  // kita langsung redirect base route '/' ke '/dashboard'
  redirect('/dashboard');
}
