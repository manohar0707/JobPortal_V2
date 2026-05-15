import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  useGetMyCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  getGetMyCompaniesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Building2, Edit, Trash2, Upload, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const companySchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
});
type CompanyForm = z.infer<typeof companySchema>;

export default function RecruiterCompanies() {
  const queryClient = useQueryClient();
  const { data: companies, isLoading } = useGetMyCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [logoTargetId, setLogoTargetId] = useState<string | null>(null);

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", description: "", website: "", location: "", industry: "", size: "" },
  });

  const openCreate = () => { setEditId(null); form.reset({}); setOpen(true); };
  const openEdit = (c: any) => {
    setEditId(c._id);
    form.reset({ name: c.name, description: c.description ?? "", website: c.website ?? "", location: c.location ?? "", industry: c.industry ?? "", size: c.size ?? "" });
    setOpen(true);
  };

  const onSubmit = (data: CompanyForm) => {
    if (editId) {
      updateCompany.mutate(
        { id: editId, data },
        {
          onSuccess: () => { toast.success("Company updated"); queryClient.invalidateQueries({ queryKey: getGetMyCompaniesQueryKey() }); setOpen(false); },
          onError: () => toast.error("Failed to update company"),
        }
      );
    } else {
      createCompany.mutate(
        { data },
        {
          onSuccess: () => { toast.success("Company created"); queryClient.invalidateQueries({ queryKey: getGetMyCompaniesQueryKey() }); setOpen(false); },
          onError: () => toast.error("Failed to create company"),
        }
      );
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteCompany.mutate({ id }, {
      onSuccess: () => { toast.success("Company deleted"); queryClient.invalidateQueries({ queryKey: getGetMyCompaniesQueryKey() }); },
      onError: () => toast.error("Failed to delete company"),
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !logoTargetId) return;
    setUploadingLogo(logoTargetId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("jp_token");
      const res = await fetch(`/api/companies/${logoTargetId}/logo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Logo uploaded");
      queryClient.invalidateQueries({ queryKey: getGetMyCompaniesQueryKey() });
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <Layout>
        <div className="container max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Companies</h1>
              <p className="text-muted-foreground mt-1">{companies?.length ?? 0} companies</p>
            </div>
            <Button onClick={openCreate} data-testid="button-add-company">
              <Plus className="h-4 w-4 mr-2" />Add Company
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : !companies?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No companies yet</p>
              <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add your first company</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {companies.map((company) => (
                <Card key={company._id} className="bg-card border-border" data-testid={`card-company-${company._id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold" data-testid={`text-company-name-${company._id}`}>{company.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {company.industry && <span>{company.industry}</span>}
                          {company.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.location}</span>}
                          {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><Globe className="h-3 w-3" />Website</a>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline" size="sm" className="text-xs"
                          disabled={uploadingLogo === company._id}
                          onClick={() => { setLogoTargetId(company._id); logoRef.current?.click(); }}
                          data-testid={`button-logo-${company._id}`}
                        >
                          {uploadingLogo === company._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(company)} data-testid={`button-edit-${company._id}`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(company._id, company.name)} data-testid={`button-delete-${company._id}`}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Company" : "Add Company"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} data-testid="input-company-name" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={2} data-testid="textarea-company-desc" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="industry" render={({ field }) => (
                      <FormItem><FormLabel>Industry</FormLabel><FormControl><Input {...field} placeholder="e.g. Tech" data-testid="input-industry" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="size" render={({ field }) => (
                      <FormItem><FormLabel>Size</FormLabel><FormControl><Input {...field} placeholder="e.g. 50-200" data-testid="input-size" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} data-testid="input-company-location" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="website" render={({ field }) => (
                    <FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} placeholder="https://..." data-testid="input-website" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" disabled={createCompany.isPending || updateCompany.isPending} data-testid="button-save-company">
                      {(createCompany.isPending || updateCompany.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {editId ? "Save Changes" : "Create Company"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
