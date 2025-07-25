import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useAuthStore } from '../../stores/authStore'

interface CustomLoginFormProps {
  onSuccess?: () => void
}

export const CustomLoginForm: React.FC<CustomLoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const { login } = useAuthStore()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }
    
    try {
      console.log('カスタムログイン開始:', email)
      
      // AuthStoreのlogin関数を使用
      await login(email, password)
      
      console.log('カスタムログイン成功')
      
      // 成功コールバック
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('カスタムログインエラー:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('ログインに失敗しました')
      }
    }
  }
  
  return (
    <Card>
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-center mb-6">社員ログイン</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Gmailアドレス
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              className="w-full"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
          >
            ログイン
          </Button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>※ Gmailアドレスと社員パスワードでログインしてください</p>
          <p>※ 権限が付与されている社員のみログイン可能です</p>
        </div>
      </div>
    </Card>
  )
} 