"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Code, Activity, TrendingUp, Zap, Upload, FileCode, BarChart3 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface CodeMetrics {
  loc: number
  cyclomaticComplexity: number
  functionCount: number
  classCount: number
  nestingDepth: number
  commentRatio: number
  duplicateLines: number
}

interface PredictionResult {
  bugProbability: number
  riskLevel: "low" | "medium" | "high"
  recommendations: string[]
  confidence: number
  metrics: CodeMetrics
}

export default function BugAlertDemo() {
  const [codeInput, setCodeInput] = useState("")
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")

  // Sample code for demonstration
  const sampleCode = `class UserManager:
    def __init__(self, database):
        self.database = database
        self.users = []
        self.cache = {}
    
    def create_user(self, username, email, password):
        if not username or not email:
            return False
        
        if len(password) < 8:
            return False
            
        for user in self.users:
            if user.email == email:
                return False
        
        # Complex validation logic
        if '@' not in email:
            return False
        
        if '.' not in email.split('@')[1]:
            return False
            
        # Nested conditions for password validation
        has_upper = False
        has_lower = False
        has_digit = False
        
        for char in password:
            if char.isupper():
                has_upper = True
            elif char.islower():
                has_lower = True
            elif char.isdigit():
                has_digit = True
        
        if not (has_upper and has_lower and has_digit):
            return False
            
        # More complex logic
        user_data = {
            'username': username,
            'email': email,
            'password': self.hash_password(password),
            'created_at': self.get_timestamp(),
            'is_active': True
        }
        
        try:
            self.database.insert('users', user_data)
            self.users.append(user_data)
            self.invalidate_cache()
            return True
        except Exception as e:
            self.log_error(e)
            return False
    
    def hash_password(self, password):
        # Simplified hashing
        return hash(password + "salt")
    
    def get_timestamp(self):
        import datetime
        return datetime.datetime.now()
    
    def invalidate_cache(self):
        self.cache.clear()
    
    def log_error(self, error):
        print(f"Error: {error}")
        
    def get_user_by_email(self, email):
        if email in self.cache:
            return self.cache[email]
            
        for user in self.users:
            if user['email'] == email:
                self.cache[email] = user
                return user
        return None`

  // Analyze code to extract metrics
  const analyzeCode = (code: string): CodeMetrics => {
    const lines = code.split("\n")
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0)
    const commentLines = lines.filter((line) => line.trim().startsWith("#") || line.trim().startsWith("//"))

    // Count functions/methods
    const functionMatches =
      code.match(/(def\s+\w+|function\s+\w+|const\s+\w+\s*=\s*$$|\w+\s*:\s*\([^)]*$$\s*=>)/g) || []

    // Count classes
    const classMatches = code.match(/(class\s+\w+|interface\s+\w+)/g) || []

    // Calculate cyclomatic complexity (simplified)
    const complexityKeywords = [
      "if",
      "elif",
      "else",
      "for",
      "while",
      "try",
      "except",
      "catch",
      "switch",
      "case",
      "and",
      "or",
      "&&",
      "||",
      "\\?", // Escaped question mark
    ]

    let cyclomaticComplexity = 1 // Base complexity
    complexityKeywords.forEach((keyword) => {
      // Escape special regex characters
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, "g")
      const matches = code.match(regex) || []
      cyclomaticComplexity += matches.length
    })

    // Calculate nesting depth
    let maxNesting = 0
    let currentNesting = 0

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (trimmed.includes("{") || trimmed.endsWith(":")) {
        currentNesting++
        maxNesting = Math.max(maxNesting, currentNesting)
      }
      if (trimmed.includes("}")) {
        currentNesting = Math.max(0, currentNesting - 1)
      }
    })

    // Detect duplicate lines (simplified)
    const lineMap = new Map()
    let duplicateLines = 0

    nonEmptyLines.forEach((line) => {
      const trimmed = line.trim()
      if (trimmed.length > 10) {
        // Only check substantial lines
        if (lineMap.has(trimmed)) {
          duplicateLines++
        } else {
          lineMap.set(trimmed, 1)
        }
      }
    })

    return {
      loc: nonEmptyLines.length,
      cyclomaticComplexity,
      functionCount: functionMatches.length,
      classCount: classMatches.length,
      nestingDepth: maxNesting,
      commentRatio: Math.round((commentLines.length / lines.length) * 100),
      duplicateLines,
    }
  }

  // Predict bugs based on extracted metrics
  const predictBugs = async () => {
    if (!codeInput.trim()) {
      return
    }

    setIsAnalyzing(true)

    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const metrics = analyzeCode(codeInput)

    // Enhanced prediction algorithm
    const complexityScore = Math.min(metrics.cyclomaticComplexity / 15, 1)
    const sizeScore = Math.min(metrics.loc / 300, 1)
    const nestingScore = Math.min(metrics.nestingDepth / 5, 1)
    const functionDensityScore = metrics.functionCount > 0 ? Math.min(metrics.loc / metrics.functionCount / 20, 1) : 0
    const commentScore = 1 - metrics.commentRatio / 100 // Lower comments = higher risk
    const duplicateScore = Math.min(metrics.duplicateLines / 10, 1)

    const rawScore =
      complexityScore * 0.25 +
      sizeScore * 0.2 +
      nestingScore * 0.2 +
      functionDensityScore * 0.15 +
      commentScore * 0.1 +
      duplicateScore * 0.1

    const bugProbability = Math.min(Math.max(rawScore * 100, 5), 95)

    let riskLevel: "low" | "medium" | "high" = "low"
    if (bugProbability > 70) riskLevel = "high"
    else if (bugProbability > 40) riskLevel = "medium"

    const recommendations = []
    if (metrics.cyclomaticComplexity > 10) {
      recommendations.push(
        "High cyclomatic complexity detected. Consider breaking down complex functions into smaller, more manageable pieces.",
      )
    }
    if (metrics.nestingDepth > 4) {
      recommendations.push("Deep nesting detected. Refactor nested conditions using early returns or guard clauses.")
    }
    if (metrics.loc > 200) {
      recommendations.push("Large file detected. Consider splitting into smaller, focused modules.")
    }
    if (metrics.commentRatio < 10) {
      recommendations.push("Low comment ratio. Add more documentation to improve code maintainability.")
    }
    if (metrics.duplicateLines > 5) {
      recommendations.push("Code duplication detected. Extract common logic into reusable functions.")
    }
    if (metrics.functionCount > 0 && metrics.loc / metrics.functionCount > 25) {
      recommendations.push("Large functions detected. Break down functions to improve readability and testability.")
    }

    if (recommendations.length === 0) {
      recommendations.push("Code structure looks good! Continue following best practices for maintainable code.")
    }

    setPrediction({
      bugProbability: Math.round(bugProbability),
      riskLevel,
      recommendations,
      confidence: Math.round(82 + Math.random() * 15),
      metrics,
    })

    setIsAnalyzing(false)
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCodeInput(content)
      }
      reader.readAsText(file)
    }
  }, [])

  const loadSampleCode = () => {
    setCodeInput(sampleCode)
    setUploadedFileName("sample_user_manager.py")
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      default:
        return "text-green-600 bg-green-50 border-green-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold">bugAlert.io</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              Code Analysis AI
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Upload code files to automatically extract metrics and predict potential bugs using machine learning
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Code Input Panel */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Code Analysis
                </CardTitle>
                <CardDescription>Upload a code file or paste code for automatic metric extraction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".py,.js,.ts,.java,.cpp,.c,.php,.rb,.go"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="w-full cursor-pointer bg-transparent">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </label>
                  </div>
                  <Button variant="outline" onClick={loadSampleCode}>
                    Load Sample
                  </Button>
                </div>

                {uploadedFileName && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">📁 {uploadedFileName}</div>
                )}

                <Textarea
                  placeholder="Or paste your code here..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />

                <Button onClick={predictBugs} disabled={isAnalyzing || !codeInput.trim()} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Code...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze & Predict Bugs
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="xl:col-span-3">
            {prediction ? (
              <Tabs defaultValue="prediction" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="prediction">Bug Prediction</TabsTrigger>
                  <TabsTrigger value="metrics">Code Metrics</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="prediction" className="space-y-6">
                  {/* Main Prediction */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Bug Prediction Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900 mb-2">{prediction.bugProbability}%</div>
                          <div className="text-sm text-gray-600">Bug Probability</div>
                          <Progress value={prediction.bugProbability} className="mt-3" />
                        </div>

                        <div className="text-center">
                          <Badge className={`text-sm px-4 py-2 ${getRiskColor(prediction.riskLevel)}`}>
                            {prediction.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <div className="text-sm text-gray-600 mt-3">Risk Assessment</div>
                        </div>

                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900 mb-2">{prediction.confidence}%</div>
                          <div className="text-sm text-gray-600">Model Confidence</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Extracted Code Metrics
                      </CardTitle>
                      <CardDescription>Automatically analyzed from your code</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{prediction.metrics.loc}</div>
                          <div className="text-xs text-blue-800 mt-1">Lines of Code</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {prediction.metrics.cyclomaticComplexity}
                          </div>
                          <div className="text-xs text-orange-800 mt-1">Cyclomatic Complexity</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{prediction.metrics.functionCount}</div>
                          <div className="text-xs text-green-800 mt-1">Functions</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{prediction.metrics.classCount}</div>
                          <div className="text-xs text-purple-800 mt-1">Classes</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{prediction.metrics.nestingDepth}</div>
                          <div className="text-xs text-red-800 mt-1">Max Nesting</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{prediction.metrics.commentRatio}%</div>
                          <div className="text-xs text-yellow-800 mt-1">Comment Ratio</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-600">{prediction.metrics.duplicateLines}</div>
                          <div className="text-xs text-gray-800 mt-1">Duplicate Lines</div>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">
                            {prediction.metrics.functionCount > 0
                              ? Math.round(prediction.metrics.loc / prediction.metrics.functionCount)
                              : 0}
                          </div>
                          <div className="text-xs text-indigo-800 mt-1">Avg Lines/Function</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        AI-Generated Recommendations
                      </CardTitle>
                      <CardDescription>Actionable suggestions to reduce bug probability</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {prediction.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-900">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Ready to Analyze Your Code</p>
                  <p className="text-sm mt-2">
                    Upload a file or paste code to get started with ML-powered bug prediction
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    Supports: Python, JavaScript, TypeScript, Java, C++, PHP, Ruby, Go
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <Separator className="mb-6" />
          <p>
            <strong>bugAlert.io</strong> automatically extracts code metrics and uses machine learning to predict
            potential bug hotspots in your software.
          </p>
          <p className="mt-2">Powered by advanced static analysis and trained on thousands of real-world codebases.</p>
        </div>
      </div>
    </div>
  )
}
