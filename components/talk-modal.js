import React, { Component, createRef } from 'react';
import RequestServer from './requestServer'
import Modal from 'react-modal'
import Link from "next/link";
import TalkEditorModal from './talk-editor-modal';
import TalkItem from './talk-item';

class TalkModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      talkItems: []
    };
    this.talkEditorModalRef = createRef();
    this.getTalkItems(props.systemCode, props.talkId, '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')
  }

  openModal = () => {
    if (!process.env.userInfo || !process.env.userInfo.USER_ID) {
      alert(`the user is not logged in. sign in first.`);

      return;
    }

    this.setState({
      showModal: true
    });
  };

  closeModal = () => {
    this.setState({
      showModal: false
    });
    this.props.setSelectedTalkName('')
  };

  getTalkItems = (systemCode, talkId, lastTalkItemId) => {
    this.talkEditorModalRef.current?.closeModal();

    // 해당 category에서 lastTalkId 이전에 작섣된 talkItem을 pageSize 갯수만클 조회함
    RequestServer("POST",
      `{"commandName": "talk.getTalkItems",
      "systemCode": "${systemCode}",
      "talkId": "${talkId}",
      "lastTalkItemId": "${lastTalkItemId}",
      "pageSize": ${this.props.pageSize}}`).then((result) => {
        // console.log(JSON.stringify(result));

        if (result.error_code == 0) {
          this.setTalkItems(result.result);
        } else {
          alert(JSON.stringify(result));
        }
      });
  }

  setTalkItems = (items) => {
    this.setState({
      talkItems: items
    });
  };

  render() {

    return (
      <div>
        <Link href="" onClick={this.openModal}>
          <h2 className='mt-2'>
            {this.props.editMode === 'New' ? '📑' : this.props.talkId?.endsWith(`_${process.env.userInfo?.USER_ID}`) ? '🖌' : ''}
          </h2>
        </Link>

        {this.state.showModal && (
          <Modal className="modal"
            isOpen={this.state.showModal}
            // onAfterOpen={openModal}
            // onRequestClose={closeModal}
            style={{
              overlay: {
                position: 'fixed',
                top: 40,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)'
              },
              content: {
                position: 'absolute',
                top: '40px',
                left: '40px',
                right: '40px',
                bottom: '40px',
                border: '1px solid #ccc',
                background: '#fff',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                backgroundColor: 'rgba(30, 41, 59, 1)'
              }
            }}
            contentLabel="New Talk">

            <div className="modal-content flex flex-col items-end">
              <span className="close text-white" onClick={this.closeModal}>
                &times;
              </span>
              <h1 className='mt-2 ml-auto mr-auto'>
                {`[${this.props.createUserId}] ${this.props.talkName}`}
              </h1>
              <div className="flex flex-col w-full justify-top px-5 mb-10 h-full overflow-auto">
                <TalkEditorModal className="m-10"
                  ref={this.talkEditorModalRef}
                  editMode='New'
                  talkId={this.props.talkId}
                  talkName={this.props.talkName}
                  getTalkItems={this.getTalkItems}
                />

                {this.state.talkItems.map(aTalkItem => (
                  <TalkItem data={aTalkItem} refreshfunc={this.getTalkItems} key={aTalkItem.TALK_ID}></TalkItem>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }
}

class TalkEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: !this.props.currentContent ?  // <= 여기 3번 : 조회한 내용으로 표시 
        EditorState.createWithContent(ContentState.createFromText("")) :
        EditorState.createWithContent(convertFromRaw(JSON.parse(this.props.currentContent))),
      talkId: props.talkId,
      talkName: props.talkName,
      title: props.currentTitle,
      darkMode: false // Assuming you have a darkMode state in your application
    };
  }

  onEditorStateChange = (editorState) => {
    if (this.props.currentTalkId?.endsWith(`_${process.env.userInfo.USER_ID}`) == false) {
      alert("this talk is read only.");
      return;
    }

    this.setState({
      editorState
    });
  };

  handleTitleChange = (event) => {
    this.setState({
      title: event.target.value
    });
  };



  createOrEditTalkItem = () => {

    const talkId = this.state.talkId;
    const talkName = this.state.talkName;
    const title = this.state.title;
    const content = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent())).replace(/\\/g, "\\\\").replace(/"/g, '\\"')// <= 여기 1번 : 입력한 내용으로 저장


    if (!process.env.userInfo || !process.env.userInfo.USER_ID) {
      alert(`the user is not logged in. sign in first.`);
      return;
    }

    if (this.props.currentTalkId?.endsWith(`_${process.env.userInfo.USER_ID}`) == false) {
      alert("Editing this talk is not permitted.");
      return;
    }

    const commandName = this.props.editMode === "New" ? "talk.createTalkItem" : "talk.editTalkItem"

    RequestServer("POST",
      `{"commandName": "${commandName}", 
      "systemCode":"00",
      "editMode":"${this.props.editMode}",
      "talkItemId":"${this.props.currentTalkItemId}",
      "talkId": "${this.state.talkId}",
      "talkItemTitle": "${title}",
      "talkItemContent": "${content}",
      "talkItemUserId": "${process.env.userInfo.USER_ID}"
     }`).then((result) => {
        if (result.error_code == 0) {
          alert("Sucessfully writed.");
          this.props.closeModal();
          this.props.getTalkItems("00", this.state.talkId, '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
        } else {
          alert(JSON.stringify(result.error_message));
        }
      })
  }



  render() {
    const { editorState, categoryId, categoryName, title, darkMode } = this.state;

    return (
      <div>
        <div className="flex items-center mb-2">
          <label className="w-20 mr-2 text-slate-100">
            Category
          </label>
          <input className="w-full"
            type="text"
            value={categoryName}
            onChange={this.handleCategoryChange} />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-20 mr-2 text-slate-100">Title</label>
          <input className="w-full" type="text" value={title} onChange={this.handleTitleChange} />
        </div>
        <div style={{ height: '100%' }}>
          <Editor
            editorState={editorState}
            // wrapperClassName="rich-editor-wrapper"
            // editorClassName="rich-editor"
            onEditorStateChange={this.onEditorStateChange}
            toolbar={{
              options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'remove', 'history'],
              inline: { options: ['bold', 'italic', 'underline', 'strikethrough'] },
              blockType: { options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'] },
              fontSize: { options: [12, 14, 16, 18, 24, 30, 36, 48, 60, 72] },
              fontFamily: { options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'] }
            }}
            editorStyle={{
              padding: 0,
              // height: '100%',
              // backgroundColor: 'slate',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="The message goes here..."
          />
        </div>
        <button className="mb-5 text-slate-100"
          onClick={this.createOrEditTalkItem}>
          ✔
        </button>
      </div>
    );
  }
}

export default TalkModal;
