import React, { Component } from 'react';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import '../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Link from "next/link";
import { convertToRaw } from 'draft-js';
import RequestServer from './requestServer'

class NewTalkEditorModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  openModal = () => {
    this.setState({
      showModal: true
    });
  };

  closeModal = () => {
    this.setState({
      showModal: false
    });
  };

  render() {
    const { showModal } = this.state;

    return (
      <div>
        <Link href="" onClick={this.openModal}><h2 className='mb-2'>Write</h2></Link>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={this.closeModal}>
                &times;
              </span>
              <NewTalkEditor currentTalkCatetory={this.props.currentTalkCatetory} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

class NewTalkEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      category: props.currentTalkCatetory,
      title: '',
      darkMode: false // Assuming you have a darkMode state in your application
    };
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState
    });
  };

  handleCategoryChange = (event) => {
    this.setState({
      category: event.target.value
    });
  };

  handleTitleChange = (event) => {
    this.setState({
      title: event.target.value
    });
  };

  createTalkItem = () => {
    // Handle submission logic here
    // For example, you can access the category, title, and editorState using this.state
    // You can send the data to a backend API, update the state of the parent component, etc.
    console.log('Category:', this.state.category);
    console.log('Title:', this.state.title);
    console.log('Editor State:', this.state.editorState);

    const category = this.state.category;
    const title = this.state.title;
    const content = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()));
  
    if(process.env.userInfo === undefined || process.env.userInfo.USER_ID === undefined || process.env.userInfo.USER_ID === ''){
      alert(`the user is not logged in. sign in first.`);
      return;
    }

    RequestServer("POST", 
    `{"commandName": "talk.createTalkItem", 
      "talkCategory": "${category}",
      "title": "${title}",
      "content": "${content}",
      "userId": "${process.env.userInfo.USER_ID}"
     }`).then((result) => {
      if(result.error_code==0){
        process.env.userInfo=result.userInfo;
        router.push('/')  
      }else {
        alert(JSON.stringify(result.error_message));
      }
    })
  }

  render() {
    const { editorState, category, title, darkMode } = this.state;

    const categoryInputStyle = {
      flex: '1',
      color: darkMode ? 'white' : 'darkgray' // Set text color based on dark or light mode
    };

    const titleInputStyle = {
      flex: '1',
      color: darkMode ? 'white' : 'darkgray' // Set text color based on dark or light mode
    };

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ marginRight: '10px', width: '80px', color: darkMode ? 'white' : 'darkgray' }}>Category:</label>
          <input className="bg-white w-full" type="text" value={category} onChange={this.handleCategoryChange}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ marginRight: '10px', width: '80px', color: darkMode ? 'white' : 'darkgray' }}>Title:</label>
          <input className="bg-white w-full" type="text" value={title} onChange={this.handleTitleChange} />
        </div>
        <div style={{ height: '100%' }}>
          <Editor
            editorState={editorState}
            wrapperClassName="rich-editor-wrapper"
            editorClassName="rich-editor"
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
              height: '100%',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="The message goes here..."
          />
        </div>
        <button className="mb-5 text-gray-600 dark:text-gray-100 hover:text-gray-400" 
                onClick={this.createTalkItem}>
          Save
        </button>
      </div>
    );
  }
}

export { NewTalkEditorModal };
