import { getLanguage } from './data/languages'
import { PracticeScreen } from './components/PracticeScreen'

export default function App() {
  const language = getLanguage('nl')!
  return <PracticeScreen language={language} onChangeLanguage={() => {}} />
}
