import React, { useState, FormEvent } from 'react';
import { Send, Cpu, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

const AIChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const userMessage = input.trim();
        if (!userMessage) return;

        // 1. Add user message to state
        const newUserMessage: Message = { id: Date.now(), text: userMessage, sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setLoading(true);

        try {
            // 2. Call the backend API
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();

            if (res.ok) {
                // 3. Add bot response to state
                const botMessage: Message = { id: Date.now() + 1, text: data.reply, sender: 'bot' };
                setMessages(prev => [...prev, botMessage]);
            } else {
                toast.error(data.reply || "AI service failed to respond.");
                const errorBotMessage: Message = { id: Date.now() + 1, text: "Error: Could not connect to inventory analysis service.", sender: 'bot' };
                setMessages(prev => [...prev, errorBotMessage]);
            }
        } catch (err) {
            console.error("Chat network error:", err);
            toast.error("Network error connecting to AI service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg mt-8 p-6">
            <h2 className="text-3xl font-extrabold text-gray-900 border-b pb-3 mb-4 flex items-center gap-3">
                <Cpu className="h-7 w-7 text-indigo-600" />
                AI Inventory Analyst
            </h2>

            {/* Chat Window */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-gray-50 mb-4 h-[500px]">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 pt-16">
                        <Package className="h-12 w-12 mx-auto mb-3" />
                        Ask about stock levels or say "Summarize my inventory health."
                    </div>
                ) : (
                    messages.map(msg => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md ${
                                msg.sender === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-gray-200 text-gray-900 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md p-3 rounded-xl bg-gray-200 text-gray-700">
                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                            Analyzing inventory...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask StockBot..."
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center disabled:opacity-50"
                    disabled={loading || !input.trim()}
                >
                    <Send className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};

export default AIChatPage;