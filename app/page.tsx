"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Eye,
  EyeOff,
  CalendarIcon,
  Github,
  Code2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimePickerDemo } from "@/components/ui/time-picker-demo";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function EmailSender() {
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [plainTextContent, setPlainTextContent] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    undefined
  );
  const [, setActiveTab] = useState("send");
  const [emailId, setEmailId] = useState("");
  const [updateScheduledAt, setUpdateScheduledAt] = useState<Date | undefined>(
    undefined
  );
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useBatch, setUseBatch] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [retrievedEmail, setRetrievedEmail] = useState<any>(null);
  const [emailPreviewSrc, setEmailPreviewSrc] = useState("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("resendApiKey");
    const storedFromName = localStorage.getItem("fromName");
    const storedFromEmail = localStorage.getItem("fromEmail");
    
    if (storedApiKey) setApiKey(storedApiKey);
    if (storedFromName) setFromName(storedFromName);
    if (storedFromEmail) setFromEmail(storedFromEmail);
  }, []);

  useEffect(() => {
    if (retrievedEmail && retrievedEmail.html) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <base target="_blank">
          </head>
          <body style="margin:0;padding:0;">
            ${retrievedEmail.html}
          </body>
        </html>
      `;
      const encodedHtml = btoa(unescape(encodeURIComponent(htmlContent)));
      setEmailPreviewSrc(`data:text/html;charset=utf-8;base64,${encodedHtml}`);
    }
  }, [retrievedEmail]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem("resendApiKey", newApiKey);
  };

  const handleFromNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFromName = e.target.value;
    setFromName(newFromName);
    localStorage.setItem("fromName", newFromName);
  };

  const handleFromEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFromEmail = e.target.value;
    setFromEmail(newFromEmail);
    localStorage.setItem("fromEmail", newFromEmail);
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailData = {
      from: `"${fromName}" <${fromEmail}>`,
      to: to.split(",").map((email) => email.trim()),
      subject,
      html: htmlContent,
      text: plainTextContent,
      reply_to: replyTo
        ? replyTo.split(",").map((email) => email.trim())
        : undefined,
      cc: cc ? cc.split(",").map((email) => email.trim()) : undefined,
      bcc: bcc ? bcc.split(",").map((email) => email.trim()) : undefined,
      scheduled_at: scheduledDate ? scheduledDate.toISOString() : undefined,
    };

    try {
      const endpoint = useBatch ? "/api/send-batch-emails" : "/api/send-email";
      const body = useBatch ? { apiKey, batch: [emailData] } : { apiKey, ...emailData };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email sent successfully",
          description: `Your email has been sent successfully.`,
        });
        // Clear form fields on success
        setFromName("");
        setFromEmail("");
        setTo("");
        setSubject("");
        setHtmlContent("");
        setPlainTextContent("");
        setReplyTo("");
        setCc("");
        setBcc("");
        setScheduledDate(undefined);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending the email",
        variant: "destructive",
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const retrieveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/retrieve-email?id=${emailId}&apiKey=${apiKey}`
      );
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email retrieved successfully",
          description: "Email details are displayed below.",
        });
        // Display the retrieved email data
        setRetrievedEmail(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while retrieving the email",
        variant: "destructive",
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/update-email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: emailId,
          apiKey,
          scheduled_at: updateScheduledAt?.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email updated successfully",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the email",
        variant: "destructive",
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/cancel-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: emailId, apiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email canceled successfully",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while canceling the email",
        variant: "destructive",
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="mx-auto sm:mx-0">
          <h1 className="group text-3xl font-bold flex items-center gap-2 font-[family-name:var(--font-geist-mono)] border-2 border-foreground w-fit h-full rounded-md leading-none select-none overflow-hidden mx-auto sm:mx-0">
            <div className="group-hover:hidden transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-10 h-full bg-foreground text-background pb-1.5 pt-2 px-1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <div className="hidden group-hover:block transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-10 h-full bg-foreground text-background pb-1.5 pt-2 px-1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z"
                />
              </svg>
            </div>

            <span className="pr-1.5">recliner</span>
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            API Client for Resend Email Service
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto flex items-center"
          >
            <a
              href="https://github.com/pujan-modha/recliner"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </a>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="w-full sm:w-auto flex items-center"
          >
            <a
              href="https://resend.com/docs/api-reference/introduction"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code2 className="mr-2 h-4 w-4" />
              Resend API
            </a>
          </Button>
        </div>
      </header>

      <main>
        <div className="mb-6 space-y-2">
          <Label htmlFor="apiKey" className="text-sm font-semibold">
            Resend API Key
          </Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Your Resend API Key"
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="link"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <Tabs
          defaultValue="send"
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="retrieve">Retrieve</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
            <TabsTrigger value="cancel">Cancel</TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <form onSubmit={sendEmail} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="fromName"
                        className="text-sm font-semibold"
                      >
                        From Name
                      </Label>
                      <Input
                        id="fromName"
                        value={fromName}
                        onChange={handleFromNameChange}
                        placeholder="Your Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="fromEmail"
                        className="text-sm font-semibold"
                      >
                        From Email
                      </Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={fromEmail}
                        onChange={handleFromEmailChange}
                        placeholder="sender@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to" className="text-sm font-semibold">
                      To (comma-separated)
                    </Label>
                    <Textarea
                      id="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="recipient1@example.com, recipient2@example.com"
                      required
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replyTo" className="text-sm font-semibold">
                      Reply To (comma-separated, optional)
                    </Label>
                    <Textarea
                      id="replyTo"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      placeholder="replyto@example.com"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cc" className="text-sm font-semibold">
                      CC (comma-separated, optional)
                    </Label>
                    <Textarea
                      id="cc"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="cc1@example.com, cc2@example.com"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bcc" className="text-sm font-semibold">
                      BCC (comma-separated, optional)
                    </Label>
                    <Textarea
                      id="bcc"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      placeholder="bcc1@example.com, bcc2@example.com"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col space-y-2 w-full">
                      <Label className="text-sm font-semibold">
                        Schedule Send (optional)
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledDate ? (
                              format(scheduledDate, "PPP")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <TimePickerDemo
                              date={scheduledDate}
                              setDate={setScheduledDate}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center space-x-2 w-full">
                      <div className="flex items-center space-x-2 mt-7">
                        <Checkbox
                          id="useBatch"
                          checked={useBatch}
                          onCheckedChange={(checked) =>
                            setUseBatch(checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="useBatch"
                          className="text-sm font-medium"
                        >
                          Use Batch Sending
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="htmlContent"
                      className="text-sm font-semibold"
                    >
                      HTML Message
                    </Label>
                    <Textarea
                      id="htmlContent"
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="Your HTML message here"
                      className="min-h-[200px] lg:min-h-[250px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="plainTextContent"
                      className="text-sm font-semibold"
                    >
                      Plain Text Message
                    </Label>
                    <Textarea
                      id="plainTextContent"
                      value={plainTextContent}
                      onChange={(e) => setPlainTextContent(e.target.value)}
                      placeholder="Your plain text message here"
                      className="min-h-[200px] lg:min-h-[250px]"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Email"
                )}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="retrieve">
            <form onSubmit={retrieveEmail} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="retrieveEmailId"
                  className="text-sm font-semibold"
                >
                  Email ID
                </Label>
                <Input
                  id="retrieveEmailId"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="Enter email ID"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrieving...
                  </>
                ) : (
                  "Retrieve Email"
                )}
              </Button>
            </form>
            {retrievedEmail && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Email Details</h3>
                  <pre className="whitespace-pre-wrap overflow-x-auto text-sm bg-muted rounded-md p-4">
                    {JSON.stringify(retrievedEmail, null, 2)}
                  </pre>
                </div>
                <div className="space-y-6">
                  {retrievedEmail.html && (
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-semibold mb-2">
                        HTML Content
                      </h3>
                      <div className="w-full h-[400px] bg-white">
                        <iframe
                          src={emailPreviewSrc}
                          title="Email HTML Content"
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  )}
                  {retrievedEmail.text && (
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-semibold mb-2">
                        Plain Text Content
                      </h3>
                      <pre className="whitespace-pre-wrap overflow-x-auto text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-inner max-h-[400px]">
                        {retrievedEmail.text}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="update">
            <form onSubmit={updateEmail} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="updateEmailId"
                  className="text-sm font-semibold"
                >
                  Email ID
                </Label>
                <Input
                  id="updateEmailId"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="Enter email ID"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-semibold">
                  New Scheduled Time
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full md:w-[280px] justify-start text-left font-normal",
                        !updateScheduledAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {updateScheduledAt ? (
                        format(updateScheduledAt, "PPP HH:mm:ss")
                      ) : (
                        <span>Pick a date and time</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={updateScheduledAt}
                      onSelect={setUpdateScheduledAt}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <TimePickerDemo
                        date={updateScheduledAt}
                        setDate={setUpdateScheduledAt}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Email"
                )}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="cancel">
            <form onSubmit={cancelEmail} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="cancelEmailId"
                  className="text-sm font-semibold"
                >
                  Email ID
                </Label>
                <Input
                  id="cancelEmailId"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="Enter email ID"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  "Cancel Email"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="mt-12 text-center text-sm text-foreground/70">
        Made with{" "}
        <span className="bg-primary text-transparent bg-clip-text animate-pulse">
          ❤️
        </span>{" "}
        by{" "}
        <Link
          href="https://pujan.pm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Pujan Modha
        </Link>
      </footer>
    </div>
  );
}
