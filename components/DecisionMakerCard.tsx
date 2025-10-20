"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  MessageCircle,
  Linkedin,
  Copy,
  ExternalLink,
  Shield,
  Briefcase,
  Clock,
  CheckCircle2,
  Send
} from 'lucide-react'

interface DecisionMaker {
  id: string
  name: string
  role: string
  seniority: string
  department?: string
  email?: string
  phone?: string
  whatsapp?: string
  linkedinUrl?: string
  salesNavUrl?: string
  tenure?: string
  skills?: string[]
  background?: string
  emailConfidence?: number
  phoneConfidence?: number
}

interface DecisionMakerCardProps {
  decisionMaker: DecisionMaker
  onOutreach?: (channel: string) => void
}

const seniorityColors: Record<string, string> = {
  'C-Level': 'bg-red-500/20 text-red-400 border-red-500/30',
  'VP': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Director': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Manager': 'bg-green-500/20 text-green-400 border-green-500/30'
}

export function DecisionMakerCard({ decisionMaker, onOutreach }: DecisionMakerCardProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleOutreach = (channel: string) => {
    if (onOutreach) {
      onOutreach(channel)
    }

    // Abrir canal diretamente
    if (channel === 'email' && decisionMaker.email) {
      window.open(`mailto:${decisionMaker.email}`, '_blank')
    } else if (channel === 'whatsapp' && decisionMaker.whatsapp) {
      window.open(`https://wa.me/${decisionMaker.whatsapp.replace(/\D/g, '')}`, '_blank')
    } else if (channel === 'linkedin' && decisionMaker.linkedinUrl) {
      window.open(decisionMaker.linkedinUrl, '_blank')
    }
  }

  return (
    <Card className="p-6 hover:shadow-xl transition-all dark:bg-slate-800 dark:border-slate-700 hover:border-purple-500/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
            <User className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg dark:text-white">{decisionMaker.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Briefcase className="h-3 w-3" />
              {decisionMaker.role}
            </p>
            {decisionMaker.tenure && (
              <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {decisionMaker.tenure}
              </p>
            )}
          </div>
        </div>
        <Badge className={seniorityColors[decisionMaker.seniority] || 'bg-slate-500/20'}>
          {decisionMaker.seniority}
        </Badge>
      </div>

      {/* Skills */}
      {decisionMaker.skills && decisionMaker.skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Skills:</p>
          <div className="flex flex-wrap gap-1">
            {decisionMaker.skills.slice(0, 5).map((skill, i) => (
              <Badge key={i} variant="outline" className="text-xs dark:border-slate-600">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Contacts */}
      <div className="space-y-2 mb-4">
        {/* Email */}
        {decisionMaker.email && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="text-sm dark:text-gray-300">{decisionMaker.email}</span>
              {decisionMaker.emailConfidence && decisionMaker.emailConfidence > 70 && (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              )}
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(decisionMaker.email!, 'email')}
                className="h-7 px-2"
              >
                {copied === 'email' ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOutreach('email')}
                className="h-7 px-2 hover:bg-blue-500/20"
              >
                <Send className="h-3 w-3 text-blue-500" />
              </Button>
            </div>
          </div>
        )}

        {/* Phone */}
        {decisionMaker.phone && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <Phone className="h-4 w-4 text-green-500" />
              <span className="text-sm dark:text-gray-300">{decisionMaker.phone}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(decisionMaker.phone!, 'phone')}
              className="h-7 px-2"
            >
              {copied === 'phone' ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}

        {/* WhatsApp */}
        {decisionMaker.whatsapp && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm dark:text-gray-300">{decisionMaker.whatsapp}</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(decisionMaker.whatsapp!, 'whatsapp')}
                className="h-7 px-2"
              >
                {copied === 'whatsapp' ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOutreach('whatsapp')}
                className="h-7 px-2 hover:bg-green-500/20"
              >
                <Send className="h-3 w-3 text-green-600" />
              </Button>
            </div>
          </div>
        )}

        {/* LinkedIn */}
        {decisionMaker.linkedinUrl && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <Linkedin className="h-4 w-4 text-blue-600" />
              <a
                href={decisionMaker.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Ver Perfil
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleOutreach('linkedin')}
              className="h-7 px-2 hover:bg-blue-500/20"
            >
              <Send className="h-3 w-3 text-blue-600" />
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 dark:border-slate-600 dark:text-white"
          onClick={() => handleOutreach('email')}
          disabled={!decisionMaker.email}
        >
          <Mail className="h-3 w-3 mr-1" />
          Email
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 dark:border-slate-600 dark:text-white"
          onClick={() => handleOutreach('whatsapp')}
          disabled={!decisionMaker.whatsapp}
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          WhatsApp
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 dark:border-slate-600 dark:text-white"
          onClick={() => handleOutreach('linkedin')}
        >
          <Linkedin className="h-3 w-3 mr-1" />
          InMail
        </Button>
      </div>
    </Card>
  )
}

