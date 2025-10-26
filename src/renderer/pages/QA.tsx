import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import MDEditor from '@uiw/react-md-editor';

interface QACollection {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  questionCount: number;
  answeredCount: number;
}

interface QAQuestion {
  id: number;
  collectionId: number;
  question: string;
  tags: string[] | null;
  status: string;
  answerCount: number;
  partialAnswerCount: number;
}

interface QAAnswer {
  id: number;
  questionId: number;
  content: string;
  isPartial: boolean;
}

export default function QA() {
  const [collections, setCollections] = useState<QACollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<QACollection | null>(null);
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QAQuestion | null>(null);
  const [answers, setAnswers] = useState<QAAnswer[]>([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [isPartialAnswer, setIsPartialAnswer] = useState(true);
  const [editingAnswer, setEditingAnswer] = useState<QAAnswer | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadQuestions(selectedCollection.id);
    }
  }, [selectedCollection]);

  useEffect(() => {
    if (selectedQuestion) {
      loadAnswers(selectedQuestion.id);
    }
  }, [selectedQuestion]);

  async function loadCollections() {
    try {
      const response = await window.api.qa.listCollections();
      if (response.ok && response.data) {
        setCollections(response.data);
        if (response.data.length > 0 && !selectedCollection) {
          setSelectedCollection(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  }

  async function loadQuestions(collectionId: number) {
    try {
      const response = await window.api.qa.listQuestions({ collectionId });
      if (response.ok && response.data) {
        setQuestions(response.data);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  }

  async function loadAnswers(questionId: number) {
    try {
      const response = await window.api.qa.listAnswers({ questionId });
      if (response.ok && response.data) {
        setAnswers(response.data);
      }
    } catch (error) {
      console.error('Failed to load answers:', error);
    }
  }

  async function handleCreateCollection() {
    if (!newCollectionName.trim()) return;
    
    try {
      const response = await window.api.qa.createCollection({
        name: newCollectionName.trim()
      });
      
      if (response.ok) {
        setNewCollectionName('');
        setShowCollectionModal(false);
        await loadCollections();
        
        window.api.notification.show({
          type: 'success',
          title: 'Collection Created',
          message: `"${newCollectionName}" collection created successfully.`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  }

  async function handleCreateQuestion() {
    if (!selectedCollection || !newQuestionText.trim()) return;
    
    try {
      const response = await window.api.qa.createQuestion({
        collectionId: selectedCollection.id,
        question: newQuestionText.trim()
      });
      
      if (response.ok) {
        setNewQuestionText('');
        setShowQuestionModal(false);
        await loadQuestions(selectedCollection.id);
        await loadCollections();
        
        window.api.notification.show({
          type: 'success',
          title: 'Question Added',
          message: 'Question added successfully.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to create question:', error);
    }
  }

  async function handleCreateAnswer() {
    if (!selectedQuestion || !newAnswerContent.trim()) return;
    
    try {
      const response = await window.api.qa.createAnswer({
        questionId: selectedQuestion.id,
        content: newAnswerContent.trim(),
        isPartial: isPartialAnswer
      });
      
      if (response.ok) {
        setNewAnswerContent('');
        await loadAnswers(selectedQuestion.id);
        await loadQuestions(selectedCollection!.id);
        await loadCollections();
        
        window.api.notification.show({
          type: 'success',
          title: 'Answer Added',
          message: isPartialAnswer ? 'Partial answer added.' : 'Complete answer added.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to create answer:', error);
    }
  }

  async function handleUpdateAnswer(answerId: number, content: string, isPartial: boolean) {
    try {
      const response = await window.api.qa.updateAnswer({
        id: answerId,
        payload: { content, isPartial }
      });
      
      if (response.ok) {
        setEditingAnswer(null);
        await loadAnswers(selectedQuestion!.id);
        await loadQuestions(selectedCollection!.id);
        
        window.api.notification.show({
          type: 'success',
          title: 'Answer Updated',
          message: 'Answer updated successfully.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to update answer:', error);
    }
  }

  async function handleDeleteAnswer(answerId: number) {
    try {
      const response = await window.api.qa.deleteAnswer({ id: answerId });
      
      if (response.ok) {
        await loadAnswers(selectedQuestion!.id);
        await loadQuestions(selectedCollection!.id);
        await loadCollections();
        
        window.api.notification.show({
          type: 'success',
          title: 'Answer Deleted',
          message: 'Answer deleted successfully.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to delete answer:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'answered': return '#03DAC6';
      case 'in_progress': return '#FF9800';
      default: return '#FF5252';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'answered': return 'Answered';
      case 'in_progress': return 'In Progress';
      default: return 'Unanswered';
    }
  }

  return (
    <div style={{ padding: '1rem', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 400px 1fr', gap: '1rem', height: '100%' }}>
        {/* Collections Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              📚 Collections
            </h2>
            <button
              onClick={() => setShowCollectionModal(true)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: '#03DAC6',
                color: '#121212',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              ➕ New
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {collections.map((collection) => (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  borderRadius: '8px',
                  background: selectedCollection?.id === collection.id ? 'rgba(3, 218, 198, 0.15)' : 'var(--card-bg)',
                  border: `2px solid ${selectedCollection?.id === collection.id ? '#03DAC6' : 'var(--card-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                  {collection.icon || '📁'} {collection.name}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>{collection.questionCount} questions</span>
                  <span style={{ color: '#03DAC6' }}>{collection.answeredCount} answered</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              ❓ Questions
            </h2>
            {selectedCollection && (
              <button
                onClick={() => setShowQuestionModal(true)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#6200EE',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                ➕ Ask
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {questions.map((question) => (
              <div
                key={question.id}
                onClick={() => setSelectedQuestion(question)}
                style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  borderRadius: '8px',
                  background: selectedQuestion?.id === question.id ? 'rgba(98, 0, 238, 0.15)' : 'var(--card-bg)',
                  border: `2px solid ${selectedQuestion?.id === question.id ? '#6200EE' : 'var(--card-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {question.question}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '10px',
                    background: `${getStatusColor(question.status)}20`,
                    color: getStatusColor(question.status),
                    fontWeight: 600
                  }}>
                    {getStatusLabel(question.status)}
                  </span>
                  
                  {question.answerCount > 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      {question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answers Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden', padding: '1rem', background: 'var(--card-bg)', borderRadius: '12px', border: '2px solid var(--card-border)' }}>
          {selectedQuestion ? (
            <>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 700 }}>
                  Question
                </h3>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {selectedQuestion.question}
                </div>
              </div>

              <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  Answers ({answers.length})
                </h3>

                {answers.map((answer) => editingAnswer?.id === answer.id ? (
                  <div key={answer.id} style={{ padding: '1rem', borderRadius: '8px', background: 'var(--hover-bg)', border: '2px solid var(--card-border)' }}>
                    <MDEditor
                      value={editingAnswer.content}
                      onChange={(val) => setEditingAnswer({ ...editingAnswer, content: val || '' })}
                      preview="edit"
                      height={200}
                    />
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                        <input
                          type="checkbox"
                          checked={!editingAnswer.isPartial}
                          onChange={(e) => setEditingAnswer({ ...editingAnswer, isPartial: !e.target.checked })}
                        />
                        <span>Complete Answer</span>
                      </label>
                      <button
                        onClick={() => handleUpdateAnswer(editingAnswer.id, editingAnswer.content, editingAnswer.isPartial)}
                        style={{
                          marginLeft: 'auto',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#03DAC6',
                          color: '#121212',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAnswer(null)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--card-border)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={answer.id} style={{ padding: '1rem', borderRadius: '8px', background: 'var(--hover-bg)', border: '2px solid var(--card-border)' }}>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '10px',
                        background: answer.isPartial ? 'rgba(255, 152, 0, 0.2)' : 'rgba(3, 218, 198, 0.2)',
                        color: answer.isPartial ? '#FF9800' : '#03DAC6',
                        fontWeight: 600
                      }}>
                        {answer.isPartial ? 'Partial' : 'Complete'}
                      </span>
                      
                      <button
                        onClick={() => setEditingAnswer(answer)}
                        style={{
                          marginLeft: 'auto',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: 'none',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAnswer(answer.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: 'none',
                          background: 'rgba(255, 82, 82, 0.1)',
                          color: '#FF5252',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                      <ReactMarkdown>{answer.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Answer Form */}
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600 }}>
                  Add Answer
                </h4>
                
                <MDEditor
                  value={newAnswerContent}
                  onChange={(val) => setNewAnswerContent(val || '')}
                  preview="edit"
                  height={150}
                />
                
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={!isPartialAnswer}
                      onChange={(e) => setIsPartialAnswer(!e.target.checked)}
                    />
                    <span>Complete Answer</span>
                  </label>
                  <button
                    onClick={handleCreateAnswer}
                    disabled={!newAnswerContent.trim()}
                    style={{
                      marginLeft: 'auto',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: newAnswerContent.trim() ? '#6200EE' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      cursor: newAnswerContent.trim() ? 'pointer' : 'not-allowed',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    Add Answer
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💡</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Select a question to view or add answers
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      {showCollectionModal && (
        <div
          onClick={() => setShowCollectionModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              border: '2px solid var(--card-border)',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
              🆕 Create New Collection
            </h3>
            
            <input
              placeholder="Collection name..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                borderRadius: '8px',
                border: '2px solid var(--card-border)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
            />
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowCollectionModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid var(--card-border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: newCollectionName.trim() ? '#03DAC6' : 'rgba(255,255,255,0.1)',
                  color: newCollectionName.trim() ? '#121212' : 'var(--text-secondary)',
                  cursor: newCollectionName.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Question Modal */}
      {showQuestionModal && (
        <div
          onClick={() => setShowQuestionModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              border: '2px solid var(--card-border)',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
              ❓ Add New Question
            </h3>
            
            <textarea
              placeholder="Enter your question..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                borderRadius: '8px',
                border: '2px solid var(--card-border)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.6
              }}
            />
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowQuestionModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid var(--card-border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQuestion}
                disabled={!newQuestionText.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: newQuestionText.trim() ? '#6200EE' : 'rgba(255,255,255,0.1)',
                  color: newQuestionText.trim() ? '#fff' : 'var(--text-secondary)',
                  cursor: newQuestionText.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
