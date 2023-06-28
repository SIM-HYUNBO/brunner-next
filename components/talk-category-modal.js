import React, { Component } from 'react';
import Modal from 'react-modal'

class TalkCategoryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      categoryId:props.categoryId
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
        <Link href="" onClick={this.openModal}>
          <h2 className='mt-2'>
            {this.state.title}  
          </h2>
        </Link>

        {showModal && (
          <Modal className="modal" 
                  isOpen={showModal}
                  onAfterOpen={this.openModal}
                  onRequestClose={this.closeModal}
                  style={{overlay: {
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

            <div className="modal-content">
              <span className="close" onClick={this.closeModal}>
                &times;
              </span>
            </div>
          </Modal>
        )}
      </div>
    );
  }
}

export { TalkEditorModal };
