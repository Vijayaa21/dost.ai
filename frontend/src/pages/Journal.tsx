import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, BookOpen, Sparkles, X, Trash2, Calendar
} from 'lucide-react';
import { journalService } from '../services/journalService';
import { JournalEntry, JournalPrompt } from '../types';
import clsx from 'clsx';
import { format } from 'date-fns';
import toast from '../utils/toast';

const tagOptions = [
  'gratitude', 'reflection', 'anxiety', 'stress', 'calm',
  'achievement', 'relationship', 'work', 'health', 'growth'
];

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prompt, setPrompt] = useState<JournalPrompt | null>(null);
  const [stats, setStats] = useState<{ total_entries: number; writing_streak: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New entry form
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    mood_at_writing: null as number | null,
    ai_reflection_enabled: true,
  });

  useEffect(() => {
    loadEntries();
    loadStats();
  }, [searchQuery]);

  const loadEntries = async () => {
    try {
      const data = await journalService.getEntries(searchQuery);
      // Ensure data is an array
      if (Array.isArray(data)) {
        setEntries(data);
      } else if (data && typeof data === 'object') {
        const apiResponse = data as { results?: JournalEntry[]; entries?: JournalEntry[] };
        const arrayData = apiResponse.results || apiResponse.entries || [];
        setEntries(Array.isArray(arrayData) ? arrayData : []);
      } else {
        setEntries([]);
      }
      setError(null);
    } catch (error) {
      toast.handleError('Load Journal Entries', error);
      setError('Failed to load journal entries. Please try again.');
      setEntries([]);
    }
  };

  const loadStats = async () => {
    try {
      const data = await journalService.getStats();
      setStats(data);
      setError(null);
    } catch (error) {
      toast.logError('Load Journal Stats', error);
      setError('Failed to load journal statistics.');
    }
  };

  const loadPrompt = async () => {
    try {
      const data = await journalService.getPrompt();
      setPrompt(data);
    } catch (error) {
      toast.logError('Load Writing Prompt', error);
    }
  };

  const handleCreate = async () => {
    if (!newEntry.content.trim()) return;

    try {
      await journalService.createEntry({
        ...newEntry,
        mood_at_writing: newEntry.mood_at_writing ?? undefined,
      });
      setIsCreating(false);
      setNewEntry({
        title: '',
        content: '',
        tags: [],
        mood_at_writing: null,
        ai_reflection_enabled: true,
      });
      loadEntries();
      loadStats();
      toast.success('Journal entry saved! ✨');
    } catch (error) {
      toast.handleError('Create Journal Entry', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await journalService.deleteEntry(id);
      setSelectedEntry(null);
      loadEntries();
      loadStats();
      setError(null);
      toast.success('Entry deleted');
    } catch (error) {
      toast.handleError('Delete Journal Entry', error);
      setError('Failed to delete entry. Please try again.');
    }
  };

  const toggleTag = (tag: string) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const openEntry = async (id: number) => {
    try {
      const entry = await journalService.getEntry(id);
      setSelectedEntry(entry);
      setError(null);
    } catch (error) {
      toast.handleError('Load Journal Entry', error);
      setError('Failed to load entry. Please try again.');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Journal</h1>
            <p className="text-gray-600">Express yourself through writing</p>
          </div>
          <button
            onClick={() => { setIsCreating(true); loadPrompt(); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-600">{stats?.total_entries || 0}</p>
            <p className="text-sm text-gray-500">Total Entries</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-lavender-600">{stats?.writing_streak || 0}</p>
            <p className="text-sm text-gray-500">Day Streak 🔥</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your entries..."
            className="input-field pl-12"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Entries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!Array.isArray(entries) || entries.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No journal entries yet</p>
              <p className="text-sm text-gray-400">Start writing to see your entries here</p>
            </div>
          ) : (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-hover cursor-pointer"
                onClick={() => openEntry(entry.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {entry.title || 'Untitled'}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {format(new Date(entry.created_at), 'MMM d')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {entry.preview || entry.content}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-lavender-100 text-lavender-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Create Entry Modal */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setIsCreating(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">New Journal Entry</h2>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Prompt suggestion */}
                  {prompt && (
                    <div className="bg-lavender-50 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-lavender-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-lavender-700">Writing prompt</p>
                          <p className="text-lavender-600">{prompt.prompt_text}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Title (optional)"
                    className="input-field mb-4"
                  />

                  {/* Content */}
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    placeholder="Write your thoughts..."
                    className="input-field resize-none h-48 mb-4"
                  />

                  {/* Tags */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {tagOptions.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={clsx(
                            'px-3 py-1 rounded-full text-sm capitalize transition-all',
                            newEntry.tags.includes(tag)
                              ? 'bg-lavender-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Reflection Toggle */}
                  <label className="flex items-center gap-3 mb-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEntry.ai_reflection_enabled}
                      onChange={(e) => setNewEntry({ ...newEntry, ai_reflection_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-primary-500"
                    />
                    <span className="text-gray-700">Enable AI reflection</span>
                  </label>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!newEntry.content.trim()}
                      className="btn-primary flex-1"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Entry Modal */}
        <AnimatePresence>
          {selectedEntry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedEntry(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {selectedEntry.title || 'Untitled'}
                      </h2>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(selectedEntry.created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(selectedEntry.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedEntry(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedEntry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-lavender-100 text-lavender-600 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div className="prose prose-gray max-w-none mb-6">
                    <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
                  </div>

                  {/* AI Reflection */}
                  {selectedEntry.ai_reflection && (
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-primary-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-primary-700 mb-1">AI Reflection</p>
                          <p className="text-primary-600">{selectedEntry.ai_reflection}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
