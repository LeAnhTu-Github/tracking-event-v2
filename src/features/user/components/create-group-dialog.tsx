import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import groupService from '@/services/group.service';
import { toast } from 'sonner';

const formSchema = z.object({
  groupName: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().min(2, 'Description must be at least 2 characters')
});

type GroupFormValues = z.infer<typeof formSchema>;

interface CreateGroupDialogProps {
  onGroupCreated: () => void;
}

export default function CreateGroupDialog({
  onGroupCreated
}: CreateGroupDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupName: '',
      description: ''
    }
  });

  const onSubmit = async (values: GroupFormValues) => {
    try {
      // Match Vue implementation: send status and groupPage fields
      const data = {
        groupName: values.groupName,
        description: values.description,
        status: 1,
        groupPage: ''
      };
      await groupService.createGroup(data);
      setIsDialogOpen(false);
      form.reset();
      onGroupCreated();
      toast.success('Thêm nhóm người dùng thành công');
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo nhóm');
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <PlusIcon className='h-4 w-4' />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new group</DialogTitle>
          <DialogDescription>
            Create a new group to manage your tasks
          </DialogDescription>
        </DialogHeader>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <FormField
            control={form.control}
            name='groupName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter group name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='Enter description' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>Save</Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
