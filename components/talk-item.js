import Image from 'next/image';

export default function TalkItem({data: talkItem}){
    // const startDate = talkItem.properties.게시일.date.start;
    // const writer = talkItem.properties.게시자.rich_text[0].plain_text;
    // const content = talkItem.properties.내용.rich_text[0].plain_text;;
    // const category = talkItem.properties.분류.rich_text[0].plain_text;;
    // const title = talkItem.properties.제목.title[0].plain_text;
    // const tags = talkItem.properties.태그.multi_select;
    // const imgSrc = talkItem.cover.file?.url || talkItem.cover.external.url;

    return (
        // 대화 항목
        <div className="talk-item flex flex-col w-full h-40 mx-auto border-yellow-500 border-1 mb-1">

          {/* 타이틀 */}
          <div className="flex flex-row w-full h-auto">  
            
            {/* 타이틀 이미지 */}
            <Image src='' alt="title image"
                    width={0} 
                    height={0} 
                    sizes="100vw" 
                    style={{ width: '100px', padding: '10px', borderColor:'gray', borderWidth: '2px' }} 
                    objectfit="cover" 
                    quality={100}
                    />

                {/* 글 제목 */}
                <div className="flex flex-col w-full p-2 border-2 border-gray-500">
                  글제목
                </div>
          </div>
          
          {/* 글 본문 */}
          <div className="flex flex-row w-full h-full p-2 border-2 border-gray-500">  
          글 본문
          </div>

        </div>
    )
}