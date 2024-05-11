`use strict`

import { useState, useEffect, useRef } from 'react';
import RequestServer from './../../../components/requestServer'
import TalkModal from '../../../components/talk-modal'

export default function TalkContent() {

  const [selectedTalkName, setSelectedTalkName] = useState([]);
  const [userTalks, setUserTalks] = useState([]);
  const [otherTalks, setOtherTalks] = useState([]);

  const getUserTalks = () => {

    RequestServer("GET",
      `{"commandName": "talk.getUserTalks",
      "systemCode": "00",
      "userId": "${!process.env.userInfo ? "" : process.env.userInfo?.USER_ID}"}`).then((result) => {

        if (result.error_code == 0) {
          setUserTalks(result.users_talks);
          setOtherTalks(result.others_talks);
        } else {
          alert(JSON.stringify(result));
        }
      });
  }

  const [newTalkTitle, setNewTalkTitle] = useState('');
  const newTalkNameRef = useRef()

  useEffect(() => {
    setUserTalks([])
    getUserTalks();
  }, [])

  const changeTalkTitleValue = (e) => {
    setNewTalkTitle(e.target.value);
  }

  const requestCreateTalkResult = (e) => {
    if (!process.env.userInfo || !process.env.userInfo.USER_ID) {
      alert(`the user is not logged in. sign in first.`);

      return;
    }

    if (!newTalkTitle) {
      alert(`the new title of the talk is required.`);
      return;
    }

    RequestServer("GET",
      `{"commandName": "talk.createTalk",
      "systemCode": "00",
      "userId": "${process.env.userInfo.USER_ID}",
      "talkName": "${newTalkTitle}"}`).then((result) => {

        if (result.result.affectedRows == 1) {
          alert(`successfully created.`);
          newTalkNameRef.current.value = "";
        } else {
          alert('failed to create a talk.');
        }
        getUserTalks();
      });
  };

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h2 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          오픈톡
        </h2>
        <div className="main-governing-text">
          다른 사람의 대화에 참여하거나 새 대화를 시작하고 사람들과 친해지세요.
        </div>
      </div>
      <nav className="flex flex-row w-full items-center text-base justify-start mb-10">
        <label className="leading-7 text-sm text-gray-600 dark:text-slate-400 mr-2">
          글제목
        </label>
        <input className="w-[calc(100vw-40rem)] mx-1 bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 leading-8 transition-colors duration-200 ease-in-out"
          type="input" onChange={(e) => changeTalkTitleValue(e)} ref={newTalkNameRef} >
        </input>
        <button className="text-white px-4 ml-2 bg-indigo-500 hover:bg-indigo-600 border-0 py-2 focus:outline-none rounded text-lg"
          onClick={(e) => (
            requestCreateTalkResult(e)
          )}>
          새글쓰기
        </button>
      </nav>

      <div className="flex w-full">

        <div className="flex flex-col w-full align-top mb-10 items-start">
          <label className="leading-7 text-sm text-gray-600 dark:text-slate-400 mr-5">
            내 글
          </label>
          <div className="flex flex-wrap w-full align-top mb-10 items-start" id='users-talk'>
            {userTalks && userTalks.map(
              (talk) => (
                <div className="flex flex-col items-start w-full" key={talk.TALK_ID}>
                  <p className="border-y-2 
                                   border-gray-400 
                                   w-full 
                                   py-2 
                                   px-8 
                                   focus:outline-none
                                   rounded 
                                   text-sm 
                                   mr-2 
                                   mb-2"
                    onClick={() => (
                      setSelectedTalkName(talk.TALK_NAME)
                    )}
                  >
                    [{talk.CREATE_USER_ID}] {talk.TALK_NAME}
                  </p>
                  <div>
                    {
                      selectedTalkName == talk.TALK_NAME &&
                      <TalkModal
                        systemCode={talk.SYSTEM_CODE}
                        talkId={talk.TALK_ID}
                        talkName={talk.TALK_NAME}
                        createUserId={talk.CREATE_USER_ID}
                        pageSize='100'
                        setSelectedTalkName={setSelectedTalkName}
                        key={talk.TALK_ID} />
                    }
                  </div>
                </div>
              ))
            }
          </div>
          <label className="leading-7 text-sm text-gray-600 dark:text-slate-400 mr-5">
            최신 글
          </label>
          <div className="flex flex-wrap w-full align-top items-start" id='others-talk'>
            {otherTalks && otherTalks.map(
              (talk) => (
                <div className="align-top w-full" key={talk.TALK_ID}>
                  <p className="border-y-2 
                                 border-gray-600 
                                 w-full 
                                 py-2 
                                 px-8 
                                 focus:outline-none 
                                 rounded 
                                 text-sm 
                                 mr-2 
                                 mb-2"
                    onClick={() => (
                      setSelectedTalkName(talk.TALK_NAME)
                    )}
                  >
                    [{talk.CREATE_USER_ID}] {talk.TALK_NAME}
                  </p>
                  <div>
                    {
                      selectedTalkName == talk.TALK_NAME &&
                      <TalkModal
                        systemCode={talk.SYSTEM_CODE}
                        talkId={talk.TALK_ID}
                        talkName={talk.TALK_NAME}
                        createUserId={talk.CREATE_USER_ID}
                        pageSize='100'
                        setSelectedTalkName={setSelectedTalkName}
                        key={talk.TALK_ID} />
                    }
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}