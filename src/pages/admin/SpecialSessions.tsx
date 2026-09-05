import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Lock, Plus, Trash2, Calendar, X, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { getAllSpecialSessions, createSpecialSession, deleteSpecialSession } from '@/services/specialSessionService';
import { SpecialSession } from '@/types/timetable';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSpecialSessions() {
  const [sessions, setSessions] = useState<SpecialSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingSession, setDeletingSession] = useState<SpecialSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    period: 'MORNING' | 'AFTERNOON' | 'FULL_DAY';
    type: 'SPECIAL';
    locked: boolean;
    description: string;
  }>({
    name: '',
    day: 'Wednesday',
    period: 'AFTERNOON',
    type: 'SPECIAL',
    locked: true,
    description: '',
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getAllSpecialSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch special sessions:', error);
      toast.error('Failed to load special sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter session name');
      return;
    }

    try {
      await createSpecialSession(formData);
      toast.success('Special session created');
      setIsModalOpen(false);
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save special session');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSession || !deletingSession.id) return;
    setIsDeleting(true);
    try {
      await deleteSpecialSession(deletingSession.id);
      setSessions(prev => prev.filter(s => s.id !== deletingSession.id));
      toast.success('Special session removed');
      setDeletingSession(null);
      await fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Locked Sessions & Institutional Events</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define mandatory locked periods that the automatic scheduling engine must preserve conflict-free.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="font-semibold shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Locked Session
          </Button>
        </div>
      </div>

      {/* Featured Hard-Locked Session: Naan Mudhalvan */}
      <Card className="border-2 border-luna-primary-blue/40 bg-linear-to-r from-luna-light-cyan/40 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-luna-primary-blue text-white flex items-center justify-center shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Naan Mudhalvan Skill Initiative</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-luna-dark-navy text-white flex items-center">
                    <Lock className="w-3 h-3 mr-1 text-luna-primary-blue" /> Hard Locked
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                  Mandatory Tamil Nadu State Skill Initiative. Every <strong>Wednesday Afternoon (Periods 6, 7 & 8)</strong> is permanently reserved. The scheduling engine strictly forbids placing theory lectures or laboratory sessions during this window.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 py-2 px-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs">
              <Calendar className="w-4 h-4 text-luna-primary-blue dark:text-cyan-400" />
              <span>Wednesday 01:40 PM – 04:20 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Sessions List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
          Registered Locked & Special Events ({sessions.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <Card key={session.id || session.name} className="border border-gray-200 dark:border-slate-800 hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{session.name}</h4>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {session.day} • {session.period} Session
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      {session.locked ? 'Engine Locked' : 'Soft Rule'}
                    </span>
                    {session.id && (
                      <button
                        onClick={() => setDeletingSession(session)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {session.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                    {session.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Special Session"
        itemName={deletingSession?.name}
        description="Are you sure you want to remove this locked session? The engine will make this time slot available again for general classes."
        isDeleting={isDeleting}
      />

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800">
                <h3 className="font-bold text-luna-dark-navy dark:text-white text-lg">Add Locked Session</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Event / Session Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Placement Training, Seminar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Day
                    </label>
                    <select
                      value={formData.day || 'Monday'}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                      className="w-full text-sm border border-gray-300 dark:border-slate-700 rounded-lg py-2 px-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Period Window
                    </label>
                    <select
                      value={formData.period || 'MORNING'}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                      className="w-full text-sm border border-gray-300 dark:border-slate-700 rounded-lg py-2 px-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="MORNING">Morning Session</option>
                      <option value="AFTERNOON">Afternoon Session</option>
                      <option value="FULL_DAY">Full Day</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Description / Notes
                  </label>
                  <Input
                    placeholder="Notes or justification for locking"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="session-locked"
                    checked={formData.locked}
                    onChange={(e) => setFormData({ ...formData, locked: e.target.checked })}
                    className="rounded border-gray-300 dark:border-slate-700 text-luna-primary-blue focus:ring-luna-primary-blue h-4 w-4"
                  />
                  <label htmlFor="session-locked" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hard Locked (Engine cannot override)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="font-semibold shadow-sm">
                    Save Session
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
