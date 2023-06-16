import Image from 'next/image';

export default function LectureItem({data: boardItem}){
    const startDate = boardItem.properties.게시일.date.start;
    const writer = boardItem.properties.게시자.rich_text[0].plain_text;
    const content = boardItem.properties.내용.rich_text[0].plain_text;;
    const category = boardItem.properties.분류.rich_text[0].plain_text;;
    const title = boardItem.properties.제목.title[0].plain_text;
    const tags = boardItem.properties.태그.multi_select;
    const imgSrc = boardItem.cover.file?.url || boardItem.cover.external.url;

    return (
        <div className="board-item">
           <Image src={imgSrc} alt="cover image"
                  width={0} 
                  height={0} 
                  sizes="100vw" 
                  style={{ width: '100%', height: '100%', padding: '10px' }} 
                  objectfit="cover" 
                  quality={100}/> 

            <div className="p-4 flex flex-col">    
                <h1>{title}</h1>
                <h6>{content}</h6>
                <h6>분류: {category}</h6>
                <div className="flex items-start mt-2">
                    {tags.map(
                        (tag)=>(
                            <h1 className="px-1 py-1 rounded-md bg-sky-200 dark:bg-sky-700 w-30" key={tag.id}>{tag.name}</h1>
                        ))
                    }
                </div>
                <h6>게시자: {writer}</h6>
                <h6>게시일: {startDate.substring(0, 10)}</h6>
            </div>   
        </div>
    )
}