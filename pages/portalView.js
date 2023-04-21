import Layout from '../components/layout';
import Head from 'next/head';
import { DATABASE_ID, TOKEN } from '../config';
import BoardItem from "../components/board-item";

export default function PortalView(pages) {
  console.log(pages);

  return (
    <Layout>    
      <Head>
        <title>Brunner 홈페이지</title>
        <meta name="description" content="서비스플랫폼"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>   
      <h1>게시글 : {pages.results.length} </h1>

      {pages.results.map(aPage=>(
        <BoardItem data={aPage} key={aPage.id}></BoardItem> 
      ))}
    </Layout>
  )
}

export async function getStaticProps() { 
  const options = {
    method: 'POST',
    headers: {
        Accept: 'application/json',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${TOKEN}`
        Authorization: `Bearer secret_9vZIZNPXvbPBJGMNnqCL3KzLBcJIgq3CZQ1KBFFQB88`
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

  //const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, options);
  const res = await fetch(`https://api.notion.com/v1/databases/97a6fdd0f8ce4a81a7ebba64bb47ba10/query`, options);

  //console.log(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`);
  //console.log(`https://api.notion.com/v1/databases/97a6fdd0f8ce4a81a7ebba64bb47ba10/query`);
  
  //console.log(options);

  const jRes = await res.json();
  //console.log(jRes);
  const results = jRes.results;
  
/*
  const tags= jRes.results.map(aPage => (
    aPage.properties.태그.multi_select.map((tag) => (
      tag.name
  ))));
  
  const categories= jRes.results.map(aPage => (
    aPage.properties.분류.rich_text[0].plain_text
  ));

  const writers= jRes.results.map(aPage => (
    aPage.properties.게시자.rich_text[0].plain_text
  ));

  const writeDate= jRes.results.map(aPage => (
    JSON.stringify(aPage.properties.게시일.date.start)
  ));
  */
  
  //console.log(`titles: ${titles}`);
  //console.log(`tags: ${tags}`);
  //console.log(`categories: ${categories}`);
  //console.log(`writers: ${writers}`);
  //console.log(`writeDate: ${writeDate}`);

  return {
    props: {results}, // will be passed to the page component as props
  }
}
