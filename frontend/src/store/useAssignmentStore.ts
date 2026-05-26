import { create } from 'zustand';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface ISection {
  name: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAssessmentResult {
  schoolName: string;
  subject: string;
  class: string;
  timeAllowed: string;
  maxMarks: number;
  sections: ISection[];
}

export interface IQuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

export interface IAssignment {
  _id: string;
  title: string;
  schoolName: string;
  subject: string;
  gradeClass: string;
  dueDate: string;
  questionsConfig: IQuestionTypeConfig[];
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lifecycleStatus: 'ongoing' | 'due' | 'completed';
  progress: number;
  errorMsg?: string;
  result?: IAssessmentResult;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const getLocalStorage = (key: string, fallback: string): string => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || fallback;
  }
  return fallback;
};

const getLocalStorageBool = (key: string, fallback: boolean): boolean => {
  if (typeof window !== 'undefined') {
    const val = window.localStorage.getItem(key);
    if (val !== null) return val === 'true';
  }
  return fallback;
};

interface AssignmentState {
  assignments: IAssignment[];
  currentAssignment: IAssignment | null;
  activeStep: 1 | 2 | 3; // 1 = Form, 2 = Generating, 3 = Question Paper Output
  activeView: 'list' | 'create' | 'settings' | 'home' | 'toolkit'; // list dashboard, creator steps, settings, home, or toolkit view
  isLoading: boolean;
  error: string | null;
  wsConnected: boolean;

  // Persistent Settings properties
  schoolName: string;
  schoolAddress: string;
  schoolLogo: string;
  userName: string;
  userAvatar: string;
  darkMode: boolean;

  fetchAssignments: () => Promise<void>;
  fetchAssignmentById: (id: string) => Promise<IAssignment>;
  createAssignment: (data: any) => Promise<IAssignment>;
  regenerateAssignment: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  updateAssignmentStatus: (id: string, status: 'ongoing' | 'due' | 'completed') => Promise<void>;
  setStep: (step: 1 | 2 | 3) => void;
  setView: (view: 'list' | 'create' | 'settings' | 'home' | 'toolkit') => void;
  setCurrentAssignment: (assignment: IAssignment | null) => void;
  connectWebSocket: (assignmentId: string) => void;
  disconnectWebSocket: () => void;
  updateSettings: (settings: { schoolName?: string; schoolAddress?: string; schoolLogo?: string; userName?: string; userAvatar?: string; }) => void;
  toggleTheme: () => void;
  initializeSettings: () => void;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';
let socket: WebSocket | null = null;

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  activeStep: 1,
  activeView: 'home',
  isLoading: false,
  error: null,
  wsConnected: false,

  // Initialize statically to prevent Next.js SSR hydration mismatch
  schoolName: 'Delhi Public School',
  schoolAddress: 'Bokaro Steel City',
  schoolLogo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=100&auto=format&fit=crop',
  userName: 'Lakshya',
  userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
  darkMode: false,

  initializeSettings: () => {
    if (typeof window !== 'undefined') {
      set({
        schoolName: window.localStorage.getItem('veda_school_name') || 'Delhi Public School',
        schoolAddress: window.localStorage.getItem('veda_school_address') || 'Bokaro Steel City',
        schoolLogo: window.localStorage.getItem('veda_school_logo') || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=100&auto=format&fit=crop',
        userName: window.localStorage.getItem('veda_user_name') || 'Lakshya',
        userAvatar: window.localStorage.getItem('veda_user_avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
        darkMode: window.localStorage.getItem('veda_dark_mode') === 'true'
      });
    }
  },

  setStep: (step) => set({ activeStep: step }),

  setView: (view) => set({ activeView: view }),
  
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

  updateSettings: (settings) => {
    set((state) => {
      const updated = {
        schoolName: settings.schoolName !== undefined ? settings.schoolName : state.schoolName,
        schoolAddress: settings.schoolAddress !== undefined ? settings.schoolAddress : state.schoolAddress,
        schoolLogo: settings.schoolLogo !== undefined ? settings.schoolLogo : state.schoolLogo,
        userName: settings.userName !== undefined ? settings.userName : state.userName,
        userAvatar: settings.userAvatar !== undefined ? settings.userAvatar : state.userAvatar,
      };
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('veda_school_name', updated.schoolName);
        window.localStorage.setItem('veda_school_address', updated.schoolAddress);
        window.localStorage.setItem('veda_school_logo', updated.schoolLogo);
        window.localStorage.setItem('veda_user_name', updated.userName);
        window.localStorage.setItem('veda_user_avatar', updated.userAvatar);
      }
      
      return updated;
    });
  },

  toggleTheme: () => {
    set((state) => {
      const newMode = !state.darkMode;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('veda_dark_mode', String(newMode));
      }
      return { darkMode: newMode };
    });
  },

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`);
      if (!response.ok) {
        throw new Error('Failed to fetch assignments list.');
      }
      const data = await response.json();
      set({ assignments: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch assignments', isLoading: false });
    }
  },

  fetchAssignmentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assignment details.');
      }
      const data = await response.json();
      set({ currentAssignment: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch assignment', isLoading: false });
      throw err;
    }
  },

  createAssignment: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create assignment.');
      }

      const created: IAssignment = await response.json();
      
      set((state) => ({
        assignments: [created, ...state.assignments],
        currentAssignment: created,
        activeView: 'create', // Switch to creative step flow
        activeStep: 2, // Shift immediately to progress animation view
        isLoading: false
      }));

      // Initiate websocket subscription
      get().connectWebSocket(created._id);

      return created;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create assignment', isLoading: false });
      throw err;
    }
  },

  regenerateAssignment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}/regenerate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to trigger regeneration.');
      }

      const updated: IAssignment = await response.json();
      
      set((state) => ({
        assignments: state.assignments.map((asm) => asm._id === id ? updated : asm),
        currentAssignment: updated,
        activeView: 'create',
        activeStep: 2, // Push back into generation processing visual state
        isLoading: false
      }));

      // Connect or re-subscribe WebSocket
      get().connectWebSocket(id);

    } catch (err: any) {
      set({ error: err.message || 'Failed to regenerate assignment', isLoading: false });
    }
  },

  deleteAssignment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete assignment.');
      }

      set((state) => ({
        assignments: state.assignments.filter((asm) => asm._id !== id),
        currentAssignment: state.currentAssignment?._id === id ? null : state.currentAssignment,
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete assignment', isLoading: false });
      throw err;
    }
  },

  updateAssignmentStatus: async (id, status) => {
    set((state) => ({
      assignments: state.assignments.map((asm) =>
        asm._id === id ? { ...asm, lifecycleStatus: status } : asm
      ),
      currentAssignment:
        state.currentAssignment?._id === id
          ? { ...state.currentAssignment, lifecycleStatus: status }
          : state.currentAssignment,
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update status.');
      }

      const updated: IAssignment = await response.json();
      set((state) => ({
        assignments: state.assignments.map((asm) => (asm._id === id ? updated : asm)),
        currentAssignment:
          state.currentAssignment?._id === id ? updated : state.currentAssignment,
      }));
    } catch (err: any) {
      console.error('Store error updating assignment status:', err);
      set({ error: err.message || 'Failed to update assignment status.' });
      get().fetchAssignments();
    }
  },

  connectWebSocket: (assignmentId) => {
    // If an existing socket exists, disconnect first
    if (socket) {
      socket.close();
    }

    const isSecure = API_BASE_URL.startsWith('https:');
    const host = API_BASE_URL.replace(/^https?:\/\//, '').replace(/\/api$/, '');
    const wsUrl = `${isSecure ? 'wss://' : 'ws://'}${host}`;
    console.log(`Opening WebSocket client connection to ${wsUrl}`);
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection successfully established.');
      set({ wsConnected: true });
      
      // Subscribe packet
      socket?.send(JSON.stringify({ type: 'subscribe', assignmentId }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress' && data.assignmentId === assignmentId) {
          set((state) => {
            const updatedAssignments = state.assignments.map((asm) => 
              asm._id === assignmentId 
                ? { 
                    ...asm, 
                    progress: data.progress, 
                    status: data.status, 
                    result: data.result, 
                    errorMsg: data.errorMsg,
                    pdfUrl: data.pdfUrl 
                  }
                : asm
            );

            const updatedCurrent = state.currentAssignment && state.currentAssignment._id === assignmentId
              ? { 
                  ...state.currentAssignment, 
                  progress: data.progress, 
                  status: data.status, 
                  result: data.result, 
                  errorMsg: data.errorMsg,
                  pdfUrl: data.pdfUrl 
                }
              : state.currentAssignment;

            // Compute the correct active UI step based on progress payload
            let nextStep = state.activeStep;
            if (data.status === 'processing' || data.status === 'pending') {
              nextStep = 2; // In Progress / processing UI
            } else if (data.status === 'completed') {
              nextStep = 3; // Visual Question Paper view UI
            } else if (data.status === 'failed') {
              nextStep = 2; // Loading container shows failed error card layout
            }

            return {
              assignments: updatedAssignments,
              currentAssignment: updatedCurrent,
              activeStep: nextStep
            };
          });
        }
      } catch (err) {
        console.error('Failed parsing received websocket message payload:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket client connection error:', err);
    };

    socket.onclose = () => {
      console.log('WebSocket client disconnected.');
      set({ wsConnected: false });
      socket = null;
    };
  },

  disconnectWebSocket: () => {
    if (socket) {
      socket.close();
      socket = null;
      set({ wsConnected: false });
    }
  }
}));
