import { useState } from 'react';
import { Project } from '../../../types/project';
import { Sprint } from '../../../types/sprint';
import { Plus, ThumbsUp, ThumbsDown, Lightbulb, FileDown, Pencil, Trash2 } from 'lucide-react';

interface RetrospectiveItem {
  id: string;
  type: 'good' | 'bad' | 'action';
  text: string;
  votes: number;
}

interface RetrospectivePanelProps {
  project: Project;
  sprints: Sprint[];
}

export function RetrospectivePanel({ project, sprints }: RetrospectivePanelProps) {
  const completedSprints = sprints.filter(s => s.status === 'CLOSED');
  const [selectedSprint, setSelectedSprint] = useState(completedSprints[0]?.id || '');

  const [items, setItems] = useState<RetrospectiveItem[]>([

  ]);

  const [addingToType, setAddingToType] = useState<'good' | 'bad' | 'action' | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleExport = () => {
    console.log('Exporting retrospective...');
  };

  const handleAddItem = (type: 'good' | 'bad' | 'action') => {
    if (!newItemText.trim()) {
      setAddingToType(null);
      return;
    }

    const newItem: RetrospectiveItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: newItemText.trim(),
      votes: 0,
    };

    setItems([...items, newItem]);
    setNewItemText('');
    setAddingToType(null);
  };

  const handleVote = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, votes: item.votes + 1 } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleStartEdit = (item: RetrospectiveItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleUpdateItem = () => {
    if (!editingText.trim()) {
      setEditingItemId(null);
      return;
    }

    setItems(items.map(item =>
      item.id === editingItemId ? { ...item, text: editingText.trim() } : item
    ));
    setEditingItemId(null);
    setEditingText('');
  };

  if (completedSprints.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No completed sprints yet</p>
          <p className="text-sm text-gray-400">Complete a sprint to create retrospectives</p>
        </div>
      </div>
    );
  }

  const categories = [
    {
      type: 'good' as const,
      title: 'What went well',
      icon: ThumbsUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      items: items.filter(i => i.type === 'good'),
    },
    {
      type: 'bad' as const,
      title: 'What could be improved',
      icon: ThumbsDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      items: items.filter(i => i.type === 'bad'),
    },
    {
      type: 'action' as const,
      title: 'Action items',
      icon: Lightbulb,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      items: items.filter(i => i.type === 'action'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sprint Retrospective</h2>
          <select
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {completedSprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export Retrospective
        </button>
      </div>

      {/* Retrospective Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.type} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <category.icon className={`w-5 h-5 ${category.color}`} />
              <h3 className="font-bold text-gray-900">{category.title}</h3>
              <span className="ml-auto px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {category.items.length}
              </span>
            </div>

            <div className="space-y-3">
              {category.items.map((item) => (
                <div key={item.id} className={`${category.bgColor} rounded-lg p-3 group relative`}>
                  {editingItemId === item.id ? (
                    <div className="space-y-2">
                      <textarea
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleUpdateItem();
                          }
                          if (e.key === 'Escape') {
                            setEditingItemId(null);
                          }
                        }}
                        className="w-full border border-orange-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none min-h-[60px] resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateItem}
                          className="flex-1 bg-orange-500 text-white text-[10px] font-bold py-1 rounded transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="flex-1 bg-gray-200 text-gray-600 text-[10px] font-bold py-1 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 hover:bg-white/50 rounded text-gray-400 hover:text-orange-600 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 hover:bg-white/50 rounded text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-900 mb-2 pr-12">{item.text}</p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleVote(item.id)}
                          className="text-xs text-gray-600 hover:text-orange-600 flex items-center gap-1 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {item.votes}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {addingToType === category.type ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddItem(category.type);
                      }
                      if (e.key === 'Escape') {
                        setAddingToType(null);
                        setNewItemText('');
                      }
                    }}
                    placeholder="Type your feedback..."
                    className="w-full border border-orange-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddItem(category.type)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setAddingToType(null);
                        setNewItemText('');
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingToType(category.type)}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-lg py-3 text-sm text-gray-600 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Sprint Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Items</div>
            <div className="text-3xl font-bold text-gray-900">{items.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Positive Items</div>
            <div className="text-3xl font-bold text-green-600">
              {items.filter(i => i.type === 'good').length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Improvement Areas</div>
            <div className="text-3xl font-bold text-red-600">
              {items.filter(i => i.type === 'bad').length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Action Items</div>
            <div className="text-3xl font-bold text-orange-600">
              {items.filter(i => i.type === 'action').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
