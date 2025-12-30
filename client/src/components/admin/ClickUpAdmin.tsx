import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Tag,
  FileText,
  Loader2,
  ExternalLink,
  Play,
  Calendar,
  Save
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Workspace {
  id: string;
  name: string;
}

interface Space {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
}

interface List {
  id: string;
  name: string;
  task_count?: number;
}

interface DefaultTags {
  status: { name: string; tag_bg: string; tag_fg: string }[];
  category: { name: string; tag_bg: string; tag_fg: string }[];
  priority: { name: string; tag_bg: string; tag_fg: string }[];
  area: { name: string; tag_bg: string; tag_fg: string }[];
  monitoring: { name: string; tag_bg: string; tag_fg: string }[];
}

interface WebsiteReport {
  status: 'online' | 'offline' | 'degraded';
  uptime?: string;
  lastUpdate?: string;
  completed: string[];
  inProgress: string[];
  todo: string[];
  issues?: string[];
  statistics?: {
    products?: number;
    orders?: number;
    users?: number;
    bookings?: number;
    quotes?: number;
  };
  recommendations?: string[];
}

interface SchedulerStats {
  isRunning: boolean;
  lastRun: string | null;
  nextRun: string | null;
  runCount: number;
  lastError: string | null;
}

interface ClickUpConfig {
  id?: string;
  workspaceId?: string;
  workspaceName?: string;
  spaceId?: string;
  spaceName?: string;
  folderId?: string;
  folderName?: string;
  listId?: string;
  listName?: string;
  isEnabled?: boolean;
  lastRunAt?: string;
}

export function ClickUpAdmin() {
  const { toast } = useToast();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedList, setSelectedList] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: configData, isLoading: loadingConfig } = useQuery<{ config: ClickUpConfig | null; stats: SchedulerStats }>({
    queryKey: ["/api/clickup/config"],
  });

  const { data: workspacesData, isLoading: loadingWorkspaces } = useQuery<{ teams: Workspace[] }>({
    queryKey: ["/api/clickup/workspaces"],
  });

  const { data: spacesData, isLoading: loadingSpaces } = useQuery<{ spaces: Space[] }>({
    queryKey: ["/api/clickup/workspaces", selectedWorkspace, "spaces"],
    queryFn: () => fetch(`/api/clickup/workspaces/${selectedWorkspace}/spaces`).then(r => r.json()),
    enabled: !!selectedWorkspace,
  });

  const { data: foldersData } = useQuery<{ folders: Folder[] }>({
    queryKey: ["/api/clickup/spaces", selectedSpace, "folders"],
    queryFn: () => fetch(`/api/clickup/spaces/${selectedSpace}/folders`).then(r => r.json()),
    enabled: !!selectedSpace,
  });

  const { data: listsData } = useQuery<{ lists: List[] }>({
    queryKey: ["/api/clickup/folders", selectedFolder, "lists"],
    queryFn: () => fetch(`/api/clickup/folders/${selectedFolder}/lists`).then(r => r.json()),
    enabled: !!selectedFolder,
  });

  const { data: folderlessListsData } = useQuery<{ lists: List[] }>({
    queryKey: ["/api/clickup/spaces", selectedSpace, "lists"],
    queryFn: () => fetch(`/api/clickup/spaces/${selectedSpace}/lists`).then(r => r.json()),
    enabled: !!selectedSpace && !selectedFolder,
  });

  const { data: defaultTags } = useQuery<DefaultTags>({
    queryKey: ["/api/clickup/default-tags"],
  });

  const { data: reportPreview, isLoading: loadingPreview, refetch: refreshPreview } = useQuery<WebsiteReport>({
    queryKey: ["/api/clickup/report-preview"],
    enabled: false,
  });

  useEffect(() => {
    if (configData?.config) {
      const config = configData.config;
      if (config.workspaceId) setSelectedWorkspace(config.workspaceId);
      if (config.spaceId) setSelectedSpace(config.spaceId);
      if (config.folderId) setSelectedFolder(config.folderId);
      if (config.listId) setSelectedList(config.listId);
      if (config.isEnabled !== undefined) setIsEnabled(config.isEnabled);
    }
  }, [configData?.config]);

  const saveConfigMutation = useMutation({
    mutationFn: async (config: Partial<ClickUpConfig>) => {
      const response = await apiRequest("POST", "/api/clickup/config", config);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuratie opgeslagen",
        description: "De ClickUp instellingen zijn opgeslagen.",
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/clickup/config"] });
    },
    onError: (error: any) => {
      toast({
        title: "Fout bij opslaan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setupTagsMutation = useMutation({
    mutationFn: async (spaceId: string) => {
      const response = await apiRequest("POST", `/api/clickup/spaces/${spaceId}/setup-tags`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Tags ingesteld",
        description: `${data.created?.length || 0} nieuwe tags aangemaakt, ${data.existing?.length || 0} bestonden al.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fout bij instellen tags",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const runSchedulerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/clickup/scheduler/run");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rapport aangemaakt",
        description: "Het maandrapport is succesvol naar ClickUp gestuurd.",
      });
      if (data.taskUrl) {
        window.open(data.taskUrl, '_blank');
      }
      queryClient.invalidateQueries({ queryKey: ["/api/clickup/config"] });
    },
    onError: (error: any) => {
      toast({
        title: "Fout bij aanmaken rapport",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const workspaces = workspacesData?.teams || [];
  const spaces = spacesData?.spaces || [];
  const folders = foldersData?.folders || [];
  const lists = selectedFolder ? (listsData?.lists || []) : (folderlessListsData?.lists || []);
  const stats = configData?.stats;

  const handleSaveConfig = () => {
    const workspaceName = workspaces.find(w => w.id === selectedWorkspace)?.name;
    const spaceName = spaces.find(s => s.id === selectedSpace)?.name;
    const folderName = folders.find(f => f.id === selectedFolder)?.name;
    const listName = lists.find(l => l.id === selectedList)?.name;

    saveConfigMutation.mutate({
      workspaceId: selectedWorkspace || undefined,
      workspaceName,
      spaceId: selectedSpace || undefined,
      spaceName,
      folderId: selectedFolder || undefined,
      folderName,
      listId: selectedList || undefined,
      listName,
      isEnabled,
    });
  };

  const handleWorkspaceChange = (value: string) => {
    setSelectedWorkspace(value);
    setSelectedSpace("");
    setSelectedFolder("");
    setSelectedList("");
    setHasChanges(true);
  };

  const handleSpaceChange = (value: string) => {
    setSelectedSpace(value);
    setSelectedFolder("");
    setSelectedList("");
    setHasChanges(true);
  };

  const handleFolderChange = (value: string) => {
    setSelectedFolder(value);
    setSelectedList("");
    setHasChanges(true);
  };

  const handleListChange = (value: string) => {
    setSelectedList(value);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">ClickUp Integratie</h2>
          <p className="text-zinc-400 mt-1">Maandelijkse website monitoring en rapportage</p>
        </div>
        {stats && (
          <div className="flex items-center gap-4">
            <Badge className={stats.isRunning ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
              {stats.isRunning ? 'Scheduler actief' : 'Scheduler gestopt'}
            </Badge>
          </div>
        )}
      </div>

      {stats && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#d0a760]" />
              Scheduler Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase">Status</p>
                <p className="text-white font-medium">{stats.isRunning ? 'Actief' : 'Gestopt'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase">Laatste run</p>
                <p className="text-white font-medium">
                  {stats.lastRun ? new Date(stats.lastRun).toLocaleString('nl-NL') : 'Nog niet uitgevoerd'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase">Volgende run</p>
                <p className="text-white font-medium">
                  {stats.nextRun ? new Date(stats.nextRun).toLocaleString('nl-NL') : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase">Aantal runs</p>
                <p className="text-white font-medium">{stats.runCount}</p>
              </div>
            </div>
            {stats.lastError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
                <p className="text-sm text-red-400">{stats.lastError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#d0a760]" />
              Configuratie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Scheduler ingeschakeld</label>
              <Switch 
                checked={isEnabled} 
                onCheckedChange={(checked) => { setIsEnabled(checked); setHasChanges(true); }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Workspace</label>
              <Select value={selectedWorkspace} onValueChange={handleWorkspaceChange}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder={loadingWorkspaces ? "Laden..." : "Selecteer workspace"} />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedWorkspace && (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Space</label>
                <Select value={selectedSpace} onValueChange={handleSpaceChange}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder={loadingSpaces ? "Laden..." : "Selecteer space"} />
                  </SelectTrigger>
                  <SelectContent>
                    {spaces.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedSpace && folders.length > 0 && (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Folder (optioneel)</label>
                <Select value={selectedFolder} onValueChange={handleFolderChange}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecteer folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Geen folder</SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedSpace && (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Lijst voor rapporten</label>
                <Select value={selectedList} onValueChange={handleListChange}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecteer lijst" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveConfig}
                disabled={!hasChanges || saveConfigMutation.isPending}
                className="flex-1 bg-[#d0a760] hover:bg-[#b8934d] text-black"
              >
                {saveConfigMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Opslaan...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Configuratie opslaan</>
                )}
              </Button>
            </div>

            {selectedSpace && (
              <Button
                onClick={() => setupTagsMutation.mutate(selectedSpace)}
                disabled={setupTagsMutation.isPending}
                variant="outline"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                {setupTagsMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Tags instellen...</>
                ) : (
                  <><Tag className="w-4 h-4 mr-2" /> Standaard tags instellen</>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#d0a760]" />
              Beschikbare Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultTags && Object.entries(defaultTags).map(([category, tags]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-zinc-400 mb-2 capitalize">{category}</h4>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag: { name: string; tag_bg: string; tag_fg: string }) => (
                    <Badge 
                      key={tag.name} 
                      style={{ backgroundColor: tag.tag_bg, color: tag.tag_fg }}
                      className="text-xs"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d0a760]" />
            Website Rapport
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshPreview()}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Preview laden
            </Button>
            <Button
              size="sm"
              onClick={() => runSchedulerMutation.mutate()}
              disabled={!selectedList || runSchedulerMutation.isPending}
              className="bg-[#d0a760] hover:bg-[#b8934d] text-black"
            >
              {runSchedulerMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Aanmaken...</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Nu uitvoeren</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPreview ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#d0a760]" />
            </div>
          ) : reportPreview ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge className={`${reportPreview.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {reportPreview.status === 'online' ? 'Online' : 'Offline'}
                </Badge>
                {reportPreview.uptime && (
                  <span className="text-zinc-400 text-sm">Uptime: {reportPreview.uptime}</span>
                )}
              </div>

              {reportPreview.statistics && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(reportPreview.statistics).map(([key, value]) => (
                    <div key={key} className="bg-zinc-800 p-3 rounded">
                      <p className="text-2xl font-bold text-white">{value}</p>
                      <p className="text-xs text-zinc-400 capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Voltooid ({reportPreview.completed.length})
                  </h4>
                  <ul className="space-y-1">
                    {reportPreview.completed.map((item, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-1">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> In uitvoering ({reportPreview.inProgress.length})
                  </h4>
                  <ul className="space-y-1">
                    {reportPreview.inProgress.map((item, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-1">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Te doen ({reportPreview.todo.length})
                  </h4>
                  <ul className="space-y-1">
                    {reportPreview.todo.map((item, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-1">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {reportPreview.recommendations && reportPreview.recommendations.length > 0 && (
                <div className="bg-zinc-800 p-4 rounded">
                  <h4 className="text-sm font-medium text-[#d0a760] mb-2">Aanbevelingen</h4>
                  <ul className="space-y-1">
                    {reportPreview.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-1">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#d0a760]" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Klik op "Preview laden" om het huidige rapport te bekijken</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
