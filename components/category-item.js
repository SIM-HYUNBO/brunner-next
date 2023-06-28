import React, { Component } from 'react';
import Link from "next/link";
import RequestServer from '@/components/requestServer'
import {TalkEditorModal} from '@/components/talk-editor-modal';
import TalkItem from '@/components/talk-item' 

class CategoryItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      talkItems: [],
      isSelectedCategory:false
    };
    this.talkEditorModal = React.createRef()
  }
    
  getTalkItems = (systemCode, talkCategoryId, lastTalkId) => {
    this.talkEditorModal.current?.closeModal();
    this.setSelectedCategory();
    
    // 해당 category에서 lastTalkId 이전에 작섣된 talkItem을 pageSize 갯수만클 조회함
    RequestServer("POST",
    `{"commandName": "talk.getTalkItems",
      "systemCode": "${systemCode}",
      "talkCategory": "${talkCategoryId}",
      "lastTalkId": "${lastTalkId}",
      "pageSize": ${this.props.pageSize}}`).then((result) => {
      // console.log(JSON.stringify(result));

      if(result.error_code==0){
        this.setTalkItems(result.talkItems);
      }else {
        alert(JSON.stringify(result));
      }
    });
  }

  setTalkItems = (newTalkItems) => {
    this.setState({
      talkItems: newTalkItems
    });
  }

  setSelectedCategory = () => {
    this.setState({
      isSelectedCategory: this.state.isSelectedCategory?false:true
    });
  }  

  render() {

    return (
      <>
        <Link legacyBehavior href="">
          <a className={`mr-5 
                        ${this.state.isSelectedCategory == true? 'text-yellow-600 dark:text-yellow-300': 
                                                                 'text-gray-600 dark:text-gray-100'} 
                       hover:text-gray-400`} 
              onClick={(e) => this.getTalkItems(this.props.systemCode, this.props.categoryId, '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>
              [{this.props.createUserId}] {this.props.categoryName}
          </a>
        </Link>
        <div className="flex flex-col w-full
            justify-top 
            px-5 
            mb-10">
          
          {this.state.isSelectedCategory && 
           <div className='grid py-1 mx-1 mt-10'>
            <TalkEditorModal className="m-10"
                             ref={this.props.talkEditorModal} 
                             editMode='New'
                             categoryId={this.props.categoryId}
                             categoryName={this.props.categoryName}
                             getTalkItems={this.getTalkItems}
                             />

            {this.state.talkItems.map(aTalkItem=>(
              <TalkItem data={aTalkItem} refreshfunc={this.getTalkItems} key={aTalkItem.TALK_ID}></TalkItem> 
            ))}              
           </div>}
        </div>
      </>
    );
  }
}

export {CategoryItem };