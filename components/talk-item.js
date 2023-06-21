import Image from 'next/image';
import { useState, useRef } from 'react'
import {TalkEditorModal} from '../components/talk-editor-modal';

export default function TalkItem({data: talkItem}){
    const talkId = talkItem.TALK_ID;
    const talkUserId = talkItem.TALK_USER_ID;
    const talkTitle = talkItem.TALK_TITLE;
    const talkContent = talkItem.TALK_CONTENT;
    const talkCategory = talkItem.TALK_CATEGORY;
    const parentTalkId = talkItem.PARENT_TALK_ID;
    const imgSrc = "/brunnerLogo.png";
    const talkEditorModal = useRef()
    
    return (
        // 대화 항목
        <div className=" border-b-2 border-b-yellow-100">
          <div className="talk-item flex flex-row w-full h-auto mx-auto mb-1">
            <TalkEditorModal className="m-10"
                            ref={talkEditorModal} 
                            mode='Edit'
                            currentTalkCatetory={talkCategory}
                            currentTitle={talkTitle}
                            currentContent={talkContent}
                            />
            {/* 타이틀 */}
            <div className="flex flex-row w-full h-auto">  
              
              {/* 타이틀 이미지 */}
              <Image src={imgSrc} 
                      alt='talkUserId'
                      width={0} 
                      height={0} 
                      sizes="100vw" 
                      style={{ width: '40px', height: '40px', padding: '10px' }} 
                      objectfit="cover" 
                      quality={100}
                      />

                  {/* 글 제목 */}
                  <div className="flex flex-col w-full p-2 text-black dark:text-white">
                    <b>[{talkUserId}] {talkTitle}</b>
                  </div>
            </div>
          </div>
         
          {/* 글 본문 */}
          <div className="flex flex-row w-full h-full mb-2 p-2 text-black dark:text-white">  
          {talkContent}
          </div>
        </div>
     )
}