import Image from 'next/image';
import { useState, useRef } from 'react'
import TalkEditorModal from './talk-editor-modal';

export default function TalkItem({ data: talkItem, refreshfunc: getTalkItems }) {
  const talkId = talkItem.TALK_ID;
  const talkUserId = talkItem.TALK_USER_ID;
  const talkTitle = talkItem.TALK_TITLE;
  const talkCategoryId = talkItem.TALK_CATEGORY_ID;
  const talkCategoryName = talkItem.CATEGORY_NAME;
  const talkContentRaw = talkItem.TALK_CONTENT.replaceAll('\\', '').substr(1).slice(0, -1);
  const parentTalkId = talkItem.PARENT_TALK_ID;
  const imgSrc = "/brunnerLogo.png";
  const talkEditorModal = useRef()
  const getText = (rawText) => {
    const mappedBlocks =
      JSON.parse(rawText).blocks.map(block => (!block.text.trim() && "\n") || block.text);

    let newText = "";
    for (let i = 0; i < mappedBlocks.length; i++) {
      const block = mappedBlocks[i];

      // handle last block
      if (i === mappedBlocks.length - 1) {
        newText += block;
      } else {
        // otherwise we join with \n, except if the block is already a \n
        if (block === "\n") newText += block;
        else newText += block + "\n";
      }
    }
    return newText;
  }


  return (
    // 대화 항목
    <div className=" border-y border-y-slate-50">
      <div className="talk-item flex flex-row w-full h-auto mx-auto mb-1">
        <TalkEditorModal className="m-10"
          ref={talkEditorModal}
          editMode='Edit'
          categoryId={talkCategoryId}
          categoryName={talkCategoryName}
          currentTalkId={talkId}
          currentTitle={talkTitle}
          currentContent={talkContentRaw}
          getTalkItems={getTalkItems}
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
          <div className="talkitem-titile flex flex-col w-full p-2 text-slate-400">
            <b>[{talkUserId}] {talkTitle}</b>
          </div>
        </div>
      </div>

      {/* 글 본문 */}
      <div className="talkitem-content flex flex-row w-full h-full mb-2 p-2 text-slate-400">
        {getText(talkContentRaw)} {/* <= 여기 2번 : 조회한 내용으로 표시 <= 이걸 pre tag로 표시하면 글이 길면 전체페이지 폭이 넘어가서 페이지 틀이 깨짐 */}
      </div>
    </div>
  )
}