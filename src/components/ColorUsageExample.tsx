import React from 'react';
import { tokens } from '@/utils/tokens';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ColorUsageExample = () => {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Color Usage Examples for #f7c624
      </h2>

      {/* Method 1: Using tokens.secondary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 1: Using tokens.secondary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button 
              style={{ backgroundColor: tokens.secondary, color: '#000' }}
              className="hover:opacity-90"
            >
              Button with tokens.secondary
            </Button>
            <Badge 
              style={{ backgroundColor: tokens.secondary, color: '#000' }}
              className="px-3 py-1"
            >
              Badge with tokens.secondary
            </Badge>
            <div 
              style={{ backgroundColor: tokens.secondary }}
              className="w-20 h-20 rounded-lg flex items-center justify-center text-black font-bold"
            >
              Box
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 2: Using Tailwind brand colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 2: Using Tailwind brand colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button className="bg-brand-yellow text-black hover:bg-brand-yellow/90">
              Button with bg-brand-yellow
            </Button>
            <Badge className="bg-brand-yellow text-black px-3 py-1">
              Badge with bg-brand-yellow
            </Badge>
            <div className="w-20 h-20 bg-brand-yellow rounded-lg flex items-center justify-center text-black font-bold">
              Box
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 3: Using direct hex value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 3: Using direct hex value</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button 
              style={{ backgroundColor: '#f7c624', color: '#000' }}
              className="hover:opacity-90"
            >
              Button with #f7c624
            </Button>
            <Badge 
              style={{ backgroundColor: '#f7c624', color: '#000' }}
              className="px-3 py-1"
            >
              Badge with #f7c624
            </Badge>
            <div 
              style={{ backgroundColor: '#f7c624' }}
              className="w-20 h-20 rounded-lg flex items-center justify-center text-black font-bold"
            >
              Box
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 4: Using Tailwind arbitrary values */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 4: Using Tailwind arbitrary values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button className="bg-[#f7c624] text-black hover:bg-[#f7c624]/90">
              Button with bg-[#f7c624]
            </Button>
            <Badge className="bg-[#f7c624] text-black px-3 py-1">
              Badge with bg-[#f7c624]
            </Badge>
            <div className="w-20 h-20 bg-[#f7c624] rounded-lg flex items-center justify-center text-black font-bold">
              Box
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 5: Text colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 5: Text colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p style={{ color: tokens.secondary }} className="text-lg font-semibold">
              Text with tokens.secondary
            </p>
            <p className="text-brand-yellow text-lg font-semibold">
              Text with text-brand-yellow
            </p>
            <p className="text-[#f7c624] text-lg font-semibold">
              Text with text-[#f7c624]
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Method 6: Border colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 6: Border colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div 
              style={{ borderColor: tokens.secondary }}
              className="w-20 h-20 border-4 rounded-lg flex items-center justify-center"
            >
              Border
            </div>
            <div className="w-20 h-20 border-4 border-brand-yellow rounded-lg flex items-center justify-center">
              Border
            </div>
            <div className="w-20 h-20 border-4 border-[#f7c624] rounded-lg flex items-center justify-center">
              Border
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 7: Gradient backgrounds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 7: Gradient backgrounds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="w-32 h-20 bg-gradient-to-r from-[#f7c624] to-[#10213f] rounded-lg flex items-center justify-center text-white font-bold">
              Gradient
            </div>
            <div className="w-32 h-20 bg-gradient-to-r from-brand-yellow to-brand-blue rounded-lg flex items-center justify-center text-white font-bold">
              Gradient
            </div>
            <div className="w-32 h-20 bg-gradient-to-br from-[#f7c624] via-[#f7c624]/80 to-[#10213f] rounded-lg flex items-center justify-center text-white font-bold">
              Gradient
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 8: Opacity variations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 8: Opacity variations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="w-20 h-20 bg-[#f7c624]/20 rounded-lg flex items-center justify-center text-black font-bold">
              20%
            </div>
            <div className="w-20 h-20 bg-[#f7c624]/40 rounded-lg flex items-center justify-center text-black font-bold">
              40%
            </div>
            <div className="w-20 h-20 bg-[#f7c624]/60 rounded-lg flex items-center justify-center text-black font-bold">
              60%
            </div>
            <div className="w-20 h-20 bg-[#f7c624]/80 rounded-lg flex items-center justify-center text-black font-bold">
              80%
            </div>
            <div className="w-20 h-20 bg-[#f7c624] rounded-lg flex items-center justify-center text-black font-bold">
              100%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorUsageExample;



