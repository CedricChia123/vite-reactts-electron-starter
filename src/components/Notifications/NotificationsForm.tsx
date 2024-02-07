import React from "react";
import axios from 'axios';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const FormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  body: z.string().min(5, { message: "Body must be at least 5 characters." }),
  date: z.string().min(1, { message: "Date is required." }),
});

type FormData = z.infer<typeof FormSchema>;

export function NotificationsForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      body: "",
      date: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (newNotification: FormData) => axios.post('http://localhost:5000/api/notifications', newNotification),
    onSuccess: () => {
      toast({
        title: "Post submitted successfully",
      });
      // Correctly invalidate the query
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting post",
        description: error?.response?.data?.message || "An error occurred while trying to submit the post.",
      });
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => mutate(data);

  return (
    <Card className="w-full md:w-[390px] h-full flex flex-col">
      <CardContent className="flex-1 overflow-auto mt-4">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                    <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                    <Input placeholder="Enter body" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <Button type="submit">Submit</Button>
        </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default NotificationsForm;
