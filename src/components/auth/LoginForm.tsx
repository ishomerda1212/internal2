import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Eye, EyeOff, Mail, Lock, Building2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '../../stores/authStore'

const schema = yup.object({
  email: yup.string().email('有効なメールアドレスを入力してください').required('メールアドレスは必須です'),
  password: yup.string().required('パスワードは必須です').min(6, 'パスワードは6文字以上で入力してください')
})

type FormData = yup.InferType<typeof schema>

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
    } catch (error: any) {
      console.error('ログインエラー:', error)
      
      // エラーメッセージを設定
      if (error.message?.includes('Invalid login credentials')) {
        setError('root', {
          type: 'manual',
          message: 'メールアドレスまたはパスワードが正しくありません'
        })
      } else if (error.message?.includes('Email not confirmed')) {
        setError('root', {
          type: 'manual',
          message: 'メールアドレスの確認が完了していません'
        })
      } else {
        setError('root', {
          type: 'manual',
          message: 'ログインに失敗しました。しばらく時間をおいて再度お試しください'
        })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-orange-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            組織管理システム
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントにログインしてください
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="メールアドレス"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="example@company.com"
              icon={<Mail className="h-4 w-4" />}
            />
            
            <div className="relative">
              <Input
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={errors.password?.message}
                placeholder="パスワードを入力"
                icon={<Lock className="h-4 w-4" />}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    ログインエラー
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {errors.root.message}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              デモ用アカウント: hr@example.com / password123
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 