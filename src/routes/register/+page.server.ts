import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';

import { prepareMail, sendEmail } from '$lib/server/email';
import { deserializeNested, prepareData } from '$lib/server/form';
import {TeamFileSchema, TeamSchema} from '$lib/server/schema';
import type { Team, TeamFile } from '$lib/server/schema';
import { UploadFile } from '$lib/server/storage';
import { supabase } from '$lib/server/supabase';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const consent = url.searchParams.get('consent');
	const verify = url.searchParams.get('verify');
	if (!consent || !verify) {
		throw redirect(302, '/policies');
	}

	const form = await superValidate(TeamSchema);

	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const { data, files } = deserializeNested(formData) as { data: Team; files: TeamFile };

		data.consent = true;

		const form = await superValidate(data, TeamSchema);

		if (!form.valid) {
			console.log(form.errors);
			return fail(400, { form, error: 'Form is not valid.\nSome input might be incorrect.' });
		}

		const teamId = crypto.randomUUID();

		const { students, team } = prepareData(teamId, data, files);

		try {
			TeamFileSchema.parse(files);
		}catch (error) {
			console.log(error);
			return fail(501, { form, error: "Files is not PDF or File's size is larger than 10 MB" });
		}

		const uploadPromise: Promise<unknown>[] = [
			UploadFile(team.teacher_citizen_card, files.teacher_citizen_card),
			UploadFile(team.teacher_verify, files.teacher_verify)
		];

		for (let i = 0; i < files.students.length; i++) {
			uploadPromise.push(
				UploadFile(students[i].image, files.students[i].image),
				UploadFile(students[i].citizen_card, files.students[i].citizen_card),
				UploadFile(students[i].student_card, files.students[i].student_card),
				UploadFile(students[i].student_certificate, files.students[i].student_certificate)
			);
		}

		try {
			await Promise.all(uploadPromise);
		} catch (error) {
			console.log(error);
			return fail(501, { form, error: error });
		}

		const { error: teamInsertError } = await supabase.from('team').insert(team);
		if (teamInsertError) {
			console.log(teamInsertError);
			return fail(500, { form, error: teamInsertError });
		}

		const { error: studentInsertError } = await supabase.from('student').insert(students);
		if (studentInsertError) {
			return fail(500, { form, error: studentInsertError });
		}

		await sendEmail(prepareMail(students, team), [
			{
				name: `${team.teacher_prefix}${team.teacher_firstname} ${team.teacher_lastname}`,
				email: team.teacher_email
			},
			...students.map((student) => {
				return {
					name: `${student.name_prefix}${student.firstname} ${student.lastname}`,
					email: student.email
				};
			})
		]);

		throw redirect(302, '/register/completed');
	}
};
