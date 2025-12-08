import { ChatInterface } from '@/components/chat-interface';
import { generateInterfaceAction } from './actions';

export default function Page() {
  return <ChatInterface generateInterface={generateInterfaceAction} />;
}
