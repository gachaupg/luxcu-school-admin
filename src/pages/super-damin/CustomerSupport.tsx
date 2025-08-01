import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchContactMessages,
  markContactMessageAsRead,
  ContactMessage,
} from "@/redux/slices/contactMessagesSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  MoreHorizontal,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Building2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CustomerSupport = () => {
  const dispatch = useAppDispatch();
  const {
    messages: contactMessages,
    loading: contactMessagesLoading,
    error: contactMessagesError,
  } = useAppSelector((state) => state.contactMessages);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch contact messages when component mounts
  useEffect(() => {
    dispatch(fetchContactMessages());
  }, [dispatch]);

  const handleMarkAsRead = (messageId: string) => {
    dispatch(markContactMessageAsRead(messageId));
  };

  const getMessageTypeBadge = (messageType: string) => {
    switch (messageType) {
      case "inquiry_message":
        return <Badge className="bg-blue-100 text-blue-800">Inquiry</Badge>;
      case "demo_request":
        return (
          <Badge className="bg-purple-100 text-purple-800">Demo Request</Badge>
        );
      case "support_message":
        return <Badge className="bg-orange-100 text-orange-800">Support</Badge>;
      default:
        return <Badge variant="outline">{messageType}</Badge>;
    }
  };

  const getReadStatusBadge = (isRead: boolean) => {
    if (isRead) {
      return <Badge className="bg-green-100 text-green-800">Read</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Unread</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredMessages = contactMessages.filter(
    (message) =>
      message.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (contactMessagesLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Support
          </h1>
          <p className="text-muted-foreground">
            Manage customer inquiries and support messages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Phone size={16} className="mr-2" />
            Support Hotline
          </Button>
          <Button>
            <MessageSquare size={16} className="mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactMessages.length}</div>
            <p className="text-xs text-muted-foreground">All time messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contact Messages
            </CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactMessages.length}</div>
            <p className="text-xs text-muted-foreground">From clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread Messages
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contactMessages.filter((m) => !m.is_read).length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages</CardTitle>
          <CardDescription>
            Messages from potential clients and existing customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contact messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages ({filteredMessages.length})</CardTitle>
          <CardDescription>
            Messages from potential clients and existing customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contactMessagesError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Messages
              </h3>
              <p className="text-muted-foreground">{contactMessagesError}</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Contact Messages
              </h3>
              <p className="text-muted-foreground">
                {contactMessages.length === 0
                  ? "No contact messages have been received yet."
                  : "No messages match your current search."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Message Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {message.first_name} {message.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {message.email_address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {message.school_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMessageTypeBadge(message.message_type)}
                    </TableCell>
                    <TableCell>{getReadStatusBadge(message.is_read)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm line-clamp-2">
                          {message.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(message.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Reply
                          </DropdownMenuItem>
                          {!message.is_read && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsRead(message.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Delete Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSupport;
