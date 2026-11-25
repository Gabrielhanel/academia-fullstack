export async function generateStaticParams() { return [{ slug: 'a' }, { slug: 'b' }]; }
export async function generateMetadata({ params }) { const { slug } = await params; return { title: 'Post ' + slug }; }
export default async function Post({ params }) { const { slug } = await params; return <h1>Post {slug}</h1>; }
