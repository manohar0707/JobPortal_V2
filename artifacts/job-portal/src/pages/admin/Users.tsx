import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAdminListUsers, useAdminDeleteUser, getAdminListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Users, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string>("all");
  const params = { page, ...(role !== "all" ? { role } : {}) };
  const { data, isLoading } = useAdminListUsers(params, { query: { queryKey: getAdminListUsersQueryKey(params) } });
  const deleteUser = useAdminDeleteUser();

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => {
        toast.success("User deleted");
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey(params) });
      },
      onError: () => toast.error("Failed to delete user"),
    });
  };

  const roleColors: Record<string, string> = {
    seeker: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    recruiter: "bg-green-500/10 text-green-500 border-green-500/20",
    admin: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="container max-w-5xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Manage Users</h1>
              <p className="text-muted-foreground mt-1">{data?.total ?? 0} total users</p>
            </div>
            <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
              <SelectTrigger className="w-36" data-testid="select-role-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="seeker">Seekers</SelectItem>
                <SelectItem value="recruiter">Recruiters</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : !data?.users?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No users found</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {data.users.map((user) => (
                  <Card key={user._id} className="bg-card border-border" data-testid={`card-user-${user._id}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={user.avatar ?? undefined} />
                          <AvatarFallback className="text-xs">{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm" data-testid={`text-user-name-${user._id}`}>{user.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={`text-xs capitalize border ${roleColors[user.role] ?? ""}`}>{user.role}</Badge>
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {new Date(user.createdAt!).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => handleDelete(user._id, user.fullName)}
                            disabled={user.role === "admin"}
                            data-testid={`button-delete-user-${user._id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(data?.pages ?? 1) > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {data?.pages}</span>
                  <Button variant="outline" size="sm" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
