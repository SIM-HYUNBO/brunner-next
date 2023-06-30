import React, { Component } from 'react';
import Link from "next/link";
import RequestServer from '@/pages/mainPages/components/requestServer'
import {TalkEditorModal} from '@/pages/mainPages/components/talk-editor-modal';
import TalkItem from '@/pages/mainPages/components/talk-item' 

class CategoryItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      talkItems: [],
    };
    this.talkEditorModal = React.createRef()
  }
    

  setTalkItems = (newTalkItems) => {
    this.setState({
      talkItems: newTalkItems
    });
  }

  render() {

    return (
      <>
        <Link legacyBehavior href=''>
          <>
          <a className={`mr-5 ${props.isSelectedCategory == true? 'text-yellow-600 dark:text-yellow-300': 'text-gray-600 dark:text-gray-100'} hover:text-gray-400`} 
              onClick={(e) => this.getTalkItems(this.props.systemCode, this.props.categoryId, '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>[{this.props.createUserId}] {this.props.categoryName}
          </a>
          </>
        </Link>
        <div className="flex flex-col w-full justify-top 
            px-5 
            mb-10">
          
          {props.isSelectedCategory && 
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