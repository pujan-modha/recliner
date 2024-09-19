"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Loader2, Eye, EyeOff, CalendarIcon, Github, Code2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [, setActiveTab] = useState("send");
  const [emailId, setEmailId] = useState("");
  const [updateScheduledAt, setUpdateScheduledAt] = useState<Date | undefined>(undefined);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useBatch, setUseBatch] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("resendApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem("resendApiKey", newApiKey);
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailData = {
      apiKey,
      from: `"${fromName}" <${fromEmail}>`,
      to: to.split(",").map((email) => email.trim()),
      subject,
      html: htmlContent,
      text: plainTextContent,
      reply_to: replyTo ? replyTo.split(",").map((email) => email.trim()) : undefined,
      cc: cc ? cc.split(",").map((email) => email.trim()) : undefined,
      bcc: bcc ? bcc.split(",").map((email) => email.trim()) : undefined,
      scheduled_at: scheduledDate ? scheduledDate.toISOString() : undefined,
    };

    try {
      const endpoint = useBatch ? "/api/send-batch-emails" : "/api/send-email";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email sent successfully",
          description: data.message,
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
      const response = await fetch(`/api/resend/retrieve-email?id=${emailId}&apiKey=${apiKey}`);
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email retrieved successfully",
          description: data.message,
        });
        console.log("Retrieved email data:", data);
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
      const response = await fetch("/api/resend/update-email", {
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
      const response = await fetch("/api/resend/cancel-email", {
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
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Mail className="w-8 h-8" />
            Recliner
          </h1>
          <p className="text-lg text-gray-600">
            Send emails using the Resend API
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
              variant="ghost"
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
                        onChange={(e) => setFromName(e.target.value)}
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
                        onChange={(e) => setFromEmail(e.target.value)}
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
                      <div className="flex items-center space-x-2">
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
                    <Label htmlFor="htmlContent" className="text-sm font-semibold">
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
                    <Label htmlFor="plainTextContent" className="text-sm font-semibold">
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
              <div className="space-y-2">
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