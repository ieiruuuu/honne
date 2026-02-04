"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Home } from "lucide-react";

interface TestResult {
  name: string;
  status: "success" | "error" | "warning" | "pending";
  message: string;
  details?: string;
}

export default function SupabaseTestPage() {
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTestingData, setIsTestingData] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const testResults: TestResult[] = [];

    // Test 1: 環境変数チェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
      testResults.push({
        name: "Environment Variable - URL",
        status: "error",
        message: "Supabase URL is not configured",
        details: `Current value: ${supabaseUrl}`,
      });
    } else {
      testResults.push({
        name: "Environment Variable - URL",
        status: "success",
        message: "Supabase URL is configured",
        details: supabaseUrl,
      });
    }

    if (!supabaseKey || supabaseKey === "placeholder-key" || supabaseKey === "your_supabase_anon_key_here") {
      testResults.push({
        name: "Environment Variable - Key",
        status: "error",
        message: "Supabase Anon Key is not configured",
        details: "Key is missing or placeholder",
      });
    } else {
      testResults.push({
        name: "Environment Variable - Key",
        status: "success",
        message: "Supabase Anon Key is configured",
        details: `${supabaseKey.substring(0, 20)}...`,
      });
    }

    // Test 2: Supabase接続テスト
    try {
      const { data, error } = await supabase.from("posts").select("count");
      
      if (error) {
        if (error.code === "42P01") {
          testResults.push({
            name: "Database Connection",
            status: "error",
            message: "Table 'posts' does not exist",
            details: "Create the 'posts' table in Supabase Dashboard",
          });
        } else if (error.message.includes("JWT")) {
          testResults.push({
            name: "Database Connection",
            status: "error",
            message: "Authentication failed - Invalid API key",
            details: error.message,
          });
        } else {
          testResults.push({
            name: "Database Connection",
            status: "error",
            message: "Database query failed",
            details: `${error.code}: ${error.message}`,
          });
        }
      } else {
        testResults.push({
          name: "Database Connection",
          status: "success",
          message: "Successfully connected to Supabase",
          details: `Found ${data?.length || 0} posts`,
        });
      }
    } catch (err) {
      testResults.push({
        name: "Database Connection",
        status: "error",
        message: "Exception during database query",
        details: err instanceof Error ? err.message : String(err),
      });
    }

    setResults(testResults);
  };

  const testDataFetch = async () => {
    setIsTestingData(true);
    
    try {
      console.log("🧪 Testing data fetch...");
      
      const { data: posts, error: postsError, count } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .limit(5);

      if (postsError) {
        console.error("❌ Error fetching posts:", postsError);
        alert(`Error: ${postsError.message}`);
      } else {
        console.log("✅ Posts fetched:", posts);
        alert(`Success! Found ${count} posts. Check console for details.`);
      }
    } catch (err) {
      console.error("❌ Exception:", err);
      alert(`Exception: ${err}`);
    } finally {
      setIsTestingData(false);
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const allPassed = results.every((r) => r.status === "success");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supabase Connection Test
          </h1>
          <p className="text-gray-600">
            Diagnose and troubleshoot Supabase configuration issues
          </p>
        </div>

        {/* Test Results */}
        <div className="space-y-4 mb-6">
          {results.map((result, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {result.name}
                    </h3>
                    <p className={`text-sm mb-2 ${
                      result.status === "success" ? "text-green-700" :
                      result.status === "error" ? "text-red-700" :
                      "text-orange-700"
                    }`}>
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className={`mb-6 ${allPassed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {allPassed ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <h3 className="font-bold text-lg">
                  {allPassed ? "✅ All Tests Passed!" : "❌ Some Tests Failed"}
                </h3>
                <p className="text-sm text-gray-700">
                  {allPassed
                    ? "Your Supabase configuration is correct. The app should work normally."
                    : "Please fix the errors above. Check BLANK_SCREEN_DIAGNOSIS.md for detailed instructions."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={runTests} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Re-run Tests
          </Button>
          
          {allPassed && (
            <Button 
              onClick={testDataFetch} 
              disabled={isTestingData}
              className="gap-2"
            >
              {isTestingData ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Data Fetch"
              )}
            </Button>
          )}
          
          <Button onClick={() => router.push("/")} variant="ghost" className="gap-2">
            <Home className="w-4 h-4" />
            Go to Home
          </Button>
        </div>

        {/* Instructions */}
        {!allPassed && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-bold text-blue-900 mb-3">🔧 How to Fix</h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                <li>Select your project → Settings → API</li>
                <li>Copy <strong>Project URL</strong> and <strong>anon public key</strong></li>
                <li>Update <code className="bg-blue-100 px-1 rounded">.env.local</code> file:
                  <pre className="bg-blue-100 p-2 rounded mt-2 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-key`}
                  </pre>
                </li>
                <li>Restart dev server: <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
                <li>Refresh this page to re-test</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Environment Info */}
        <Card className="mt-6 bg-gray-100">
          <CardContent className="pt-6">
            <h3 className="font-bold text-gray-900 mb-3">📋 Current Configuration</h3>
            <div className="space-y-2 text-sm font-mono">
              <div>
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_URL:</span>
                <p className="text-gray-900 break-all">{process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <p className="text-gray-900">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30)}...` 
                    : "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
