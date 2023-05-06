import Layout from '../components/layout';
import Head from 'next/head';
import dotenv from 'dotenv';
import BoardItem from "../components/board-item";

export default function PortalView(pages) {
  console.log(pages);

  return (
    <Layout>    
    <div className="flex flex-col items-center justify-center min-h-screen px-5 mb-10">
      <Head>
          <title>Brunner Home</title>
          <meta name="description" content="서비스플랫폼"></meta>
          <meta rel="icon" href="brunnerLogo.png"></meta>
          <link></link>
        </Head>   
        <h1 className="text-2xl">
          게시글 : <span className="pl-2 text-blue-500">{pages.results.length}</span>
          </h1>

        <div className='grid grid-cols-1 md:grid-cols-5 py-10 m-3 gap-6'>
          {pages.results.map(aPage=>(
            <BoardItem data={aPage} key={aPage.id}></BoardItem> 
          ))}
        </div>

    </div>
    </Layout>
  )
}

export async function getStaticProps() { 
  dotenv.config();

  const options = {
    method: 'POST',
    headers: {
        Accept: 'application/json',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DATABASE_TOKEN}`
    },
    body: JSON.stringify({
      sorts: [
        {
          "property" : "게시일",
          "direction":"descending"
        }
      ],
      page_size:100})
  };

  console.log(`https://api.notion.com/v1/databases/${process.env.DATABASE_ID}/query`);
  console.log(options);
  
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.DATABASE_ID}/query`, options);
  
  const jRes = await res.json();
  const results = jRes.results;

  return {
    props: {results}, // will be passed to the page component as props
  }
}
