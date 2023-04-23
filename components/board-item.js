import Image from 'next/image';

export default function BoardItem({data}){
    const startDate=data.properties.게시일.date.start;
    const writer=data.properties.게시자.rich_text[0].plain_text;
    const content=data.properties.내용.rich_text[0].plain_text;;
    const category=data.properties.분류.rich_text[0].plain_text;;
    const title=data.properties.제목.title[0].plain_text;
    const tags=data.properties.태그.multi_select;
    const imgSrc=data.cover.file?.url || data.cover.external.url;

    return (
        <div className="board-item">
           <Image src={imgSrc} alt="cover image"
                  width={0} height={0} sizes="100vw" style={{ width: '100%', height: '100%' }} objectfit="cover" quality={100} /> 

            <div className="p-4 flex flex-col">    
                <h1>{title}</h1>
                <h6>{content}</h6>
                <h6>분류: {category}</h6>
                <div className="flex items-start mt-2">
                    {tags.map(
                        (tag)=>(
                            <h1 className="px-2 py-1 mr-1 rounded-md bg-sky-200 dark:bg-sky-700 w-30" key={tag.id}>{tag.name}</h1>
                        ))
                    }
                </div>
                <h6>게시자: {writer}</h6>
                <h6>게시일: {startDate.substring(0, 10)}</h6>
            </div>   
        </div>
    )
}