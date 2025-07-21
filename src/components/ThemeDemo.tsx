import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const ThemeDemo = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Theme Demo</span>
            <Badge variant={isDark ? "secondary" : "default"}>
              {isDark ? "Dark Mode" : "Light Mode"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-input">Sample Input</Label>
              <Input id="demo-input" placeholder="Type something..." />
            </div>
            <div className="space-y-2">
              <Label>Sample Switch</Label>
              <div className="flex items-center space-x-2">
                <Switch id="demo-switch" />
                <Label htmlFor="demo-switch">Toggle me</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>

          <div className="flex gap-2">
            <Badge>Default Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="destructive">Destructive Badge</Badge>
            <Badge variant="outline">Outline Badge</Badge>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={toggleTheme} className="w-full">
              Toggle Theme (Current: {theme})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
